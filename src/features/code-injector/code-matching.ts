import { parse as parseJavaScript, type Node as JsNode } from 'acorn';
import { parse, parseFragment, type DefaultTreeAdapterTypes } from 'parse5';
import { parse as parseCss, type ChildNode } from 'postcss';
import type { CodeKind, CodeTemplate } from '../../../supabase/functions/_shared/workspace-contracts';

export type CodeItem = { key: string; label: string; start: number; end: number; needs?: string[]; parts?: string[] };
type Scan = { items: CodeItem[]; warnings: string[] };
type Ast = JsNode & Record<string, unknown>;
type HtmlElement = DefaultTreeAdapterTypes.Element;
const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

function signature(value: unknown): string {
  return JSON.stringify(value, (key, item) => ['start', 'end', 'loc', 'range', 'raw'].includes(key) ? undefined
    : typeof item === 'bigint' ? item.toString() + 'n' : item);
}

function bindings(node: unknown): string[] {
  if (!node || typeof node !== 'object') return [];
  const value = node as Ast;
  if (value.type === 'Identifier') return [String(value.name)];
  if (value.type === 'AssignmentPattern') return bindings(value.left);
  if (value.type === 'RestElement') return bindings(value.argument);
  if (value.type === 'ObjectPattern') return (value.properties as Ast[]).flatMap(prop => bindings(prop.value ?? prop));
  if (value.type === 'ArrayPattern') return (value.elements as Ast[]).flatMap(bindings);
  return [];
}

function jsItems(source: string, offset: number): CodeItem[] {
  let program;
  try { program = parseJavaScript(source, { ecmaVersion: 'latest', sourceType: 'module' }); }
  catch { program = parseJavaScript(source, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true }); }
  return program.body.flatMap(statement => {
    const node = statement as unknown as Ast;
    const declaration = (node.declaration ?? node) as Ast;
    const names = declaration.type === 'VariableDeclaration' ? (declaration.declarations as Ast[]).flatMap(item => bindings(item.id))
      : bindings(declaration.id);
    let keys = names.map(name => 'js:binding:' + name);
    let labels = names.map(name => 'JavaScript ' + name);
    if (node.type === 'ImportDeclaration') {
      const module = String((node.source as Ast).value);
      const specs = node.specifiers as Ast[];
      const imports = specs.map(item => String((item.local as Ast).name));
      keys = (imports.length ? imports : ['']).map(name => 'js:import:' + JSON.stringify([module, name]));
      labels = (imports.length ? imports : ['side effect']).map(name => module + ' · ' + name);
    }
    if (!keys.length) {
      keys = ['js:statement:' + signature(node)];
      labels = [source.slice(node.start, node.end).replace(/\s+/g, ' ').slice(0, 84)];
    }
    return keys.map((key, i) => ({ key, label: labels[i], start: offset + node.start, end: offset + node.end, needs: keys }));
  });
}

function cssItems(source: string, offset: number): CodeItem[] {
  function properties(node: ChildNode): string[] {
    if (node.type === 'decl') return [node.prop.startsWith('--') ? node.prop : node.prop.toLowerCase()];
    if (node.type === 'rule' || node.type === 'atrule') {
      const name = node.type === 'rule' ? node.selector.trim() : '@' + node.name + ' ' + node.params.trim();
      return (node.nodes ?? []).flatMap(child => properties(child).map(key => name + '/' + key));
    }
    return node.type === 'comment' ? ['comment:' + node.text] : [];
  }
  return parseCss(source).nodes.flatMap(node => {
    if (node.type === 'comment') return [];
    const start = node.source?.start?.offset;
    const end = node.source?.end?.offset;
    if (start === undefined || end === undefined) return [];
    const label = node.type === 'rule' ? node.selector.trim() : node.type === 'atrule'
      ? '@' + node.name + ' ' + node.params.trim() : 'Declaration ' + node.prop;
    const key = node.type === 'decl' ? 'css:decl:' + node.prop
      : 'css:' + node.type + ':' + (node.type === 'atrule' && !node.nodes ? label + '/' + node.toString() : label);
    return [{ key, label, start: offset + start, end: offset + end, parts: properties(node) }];
  });
}

function schemaItems(value: unknown, start: number, end: number): CodeItem[] {
  const types = new Set<string>();
  let untyped = false;
  function visit(node: unknown) {
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (!node || typeof node !== 'object') return;
    const object = node as Record<string, unknown>;
    const type = object['@type'];
    const group = typeof type === 'string' ? [type] : Array.isArray(type) ? type.filter(item => typeof item === 'string') : [];
    group.forEach((name: string) => types.add(name.replace(/^https?:\/\/schema\.org\//, '')));
    if (object['@graph']) visit(object['@graph']);
    else if (!group.length) untyped = true;
  }
  visit(value);
  const keys = [...types].map(type => 'schema:' + type);
  return [...types].map((type, i) => ({ key: keys[i], label: 'JSON-LD ' + type, start, end,
    needs: untyped ? [...keys, 'schema:untyped-node'] : keys }));
}

function htmlItems(source: string, scanNested: boolean): Scan {
  const bom = source.startsWith('\uFEFF') ? 1 : 0;
  const text = source.slice(bom);
  const options = { sourceCodeLocationInfo: true };
  const root = scanNested || /^\s*(?:<!doctype\b|<html[\s>])/i.test(text) ? parse(text, options) : parseFragment(text, options);
  const items: CodeItem[] = [];
  const warnings: string[] = [];
  function visit(node: DefaultTreeAdapterTypes.Node) {
    if ('tagName' in node && node.sourceCodeLocation?.startTag) {
      const element = node as HtmlElement;
      const location = element.sourceCodeLocation!;
      const start = location.startOffset + bom;
      const end = location.endOffset + bom;
      const tag = element.tagName;
      const attrs = new Map(element.attrs.map(attr => [attr.name, attr.value]));
      const original = source.slice(start, end);
      const type = attrs.get('type')?.toLowerCase().trim();
      const innerStart = location.startTag!.endOffset + bom;
      const innerEnd = (location.endTag?.startOffset ?? location.endOffset) + bom;
      const inner = source.slice(innerStart, innerEnd);
      const closed = voidElements.has(tag) || !!location.endTag;
      const initialCount = items.length;
      if (tag === 'script' && type === 'application/ld+json') {
        try {
          const found = schemaItems(JSON.parse(inner), start, end);
          if (!found.length) warnings.push('A JSON-LD script has no identifiable root or graph schema types.');
          items.push(...found);
        } catch { warnings.push('A JSON-LD script could not be parsed.'); }
      } else if (tag === 'style' || (tag === 'script' && !attrs.has('src') &&
          (!type || ['module', 'text/javascript', 'application/javascript'].includes(type)))) {
        try {
          const nested = tag === 'style' ? cssItems(inner, innerStart) : jsItems(inner, innerStart);
          const keys = nested.map(item => item.key);
          items.push(...nested.map(item => scanNested ? item : { ...item, start, end, needs: keys }));
        } catch { warnings.push('An inline ' + tag + ' block could not be parsed.'); }
      } else {
        let identity = '';
        let protectsContents = false;
        if (tag === 'title' || tag === 'base') identity = 'singleton';
        else if (tag === 'meta') {
          const field = ['name', 'property', 'http-equiv', 'charset', 'itemprop'].find(name => attrs.has(name));
          if (field) identity = field + ':' + (field === 'charset' ? '' : attrs.get(field)?.toLowerCase());
        } else if (tag === 'link' && attrs.has('rel')) {
          const rel = (attrs.get('rel') ?? '').toLowerCase().split(/\s+/).sort().join(' ');
          identity = rel + ':' + (rel === 'canonical' ? '' : attrs.get('href') ?? '');
        } else if (tag === 'script' && attrs.has('src')) identity = 'src:' + attrs.get('src');
        else if (attrs.has('id')) { identity = '#' + attrs.get('id'); protectsContents = true; }
        if (!identity) { identity = original; protectsContents = true; }
        items.push({ key: 'html:' + tag + ':' + identity, label: '<' + tag + '>' + (identity === original ? '' : ' ' + identity),
          start, end, parts: protectsContents ? [original] : undefined });
      }
      if (!closed) {
        for (const item of items.slice(initialCount)) item.needs = [...(item.needs ?? []), 'missing-html-end-tag'];
      }
      if (!scanNested) return;
    }
    if ('childNodes' in node) node.childNodes.forEach(visit);
  }
  root.childNodes.forEach(visit);
  return { items, warnings };
}

export function readTemplate(kind: CodeKind, source: string): CodeItem[] {
  if (kind === 'html' || (kind === 'script' && /^\s*<script[\s>]/i.test(source))) {
    const result = htmlItems(source, false);
    if (result.warnings.length) throw new Error(result.warnings[0]);
    return result.items;
  }
  if (kind === 'script' && /^\s*(?:\{|\[)/.test(source)) {
    let value: unknown;
    try { value = JSON.parse(source); } catch { /* may be JavaScript source */ }
    const items = schemaItems(value, 0, source.length);
    if (items.length) return items;
  }
  return kind === 'script' ? jsItems(source, 0) : cssItems(source, 0);
}

export function inspectSource(path: string, source: string): Scan {
  if (/\.html?$/i.test(path)) return htmlItems(source, true);
  if (/\.json(?:ld)?$/i.test(path)) {
    try {
      const value = JSON.parse(source);
      const documents = Array.isArray(value) ? value : [value];
      const isJsonLd = /\.jsonld$/i.test(path) ||
        documents.some(node => node && typeof node === 'object' && Object.hasOwn(node, '@context'));
      return {
        items: isJsonLd ? schemaItems(value, 0, source.length) : [],
        warnings: isJsonLd ? [] : ['This JSON file has no JSON-LD context. Check the proposed insertion against its structure.'],
      };
    } catch { return { items: [], warnings: ['This JSON document could not be parsed.'] }; }
  }
  if (/\.css$/i.test(path)) {
    try { return { items: cssItems(source, 0), warnings: [] }; }
    catch { return { items: [], warnings: ['This CSS file could not be parsed.'] }; }
  }
  if (/\.(?:js|mjs|cjs|ts|jsx|tsx)$/i.test(path)) {
    try { return { items: jsItems(source, 0), warnings: [] }; }
    catch { return { items: [], warnings: ['This file uses syntax outside the JavaScript matcher. Check for duplicates before continuing.'] }; }
  }
  if (/^\s*(?:<!doctype\b|<[a-z][\w:-]*[\s/>])/i.test(source)) return htmlItems(source, true);
  const items: CodeItem[] = [];
  try { items.push(...jsItems(source, 0)); } catch { /* other text syntax */ }
  try { items.push(...cssItems(source, 0)); } catch { /* other text syntax */ }
  return { items, warnings: effectsUnknown(items) };
}

function effectsUnknown(items: CodeItem[]) {
  return items.length ? [] : ['This source format has no recognized HTML, JavaScript, CSS or JSON-LD syntax. Check for duplicates manually.'];
}

export type ParsedTemplate = CodeTemplate & { items: CodeItem[] };
export function presence(templates: ParsedTemplate[], existing: CodeItem[]) {
  const found = new Set(existing.map(item => item.key));
  const items = templates.flatMap(template => template.items);
  const count = items.filter(item => found.has(item.key)).length;
  return count === 0 ? 'absent' : count === items.length ? 'complete' : 'partial';
}

export function compareTemplates(templates: ParsedTemplate[], existing: CodeItem[]) {
  const incoming = new Map<string, CodeItem>();
  let repeated = false;
  for (const item of templates.flatMap(template => template.items)) {
    if (incoming.has(item.key)) repeated = true;
    incoming.set(item.key, item);
  }
  const matches = existing.filter(item => incoming.has(item.key));
  const blocked = matches.some(item => item.needs?.some(key => !incoming.has(key)) ||
    item.parts?.some(part => !incoming.get(item.key)?.parts?.includes(part)));
  return { matches, blocked, repeated };
}

export function sourceLines(source: string) {
  const lines = [];
  const pattern = /\r\n|\n|\r/g;
  let offset = source.startsWith('\uFEFF') ? 1 : 0;
  for (const match of source.matchAll(pattern)) {
    lines.push({ offset, text: source.slice(offset, match.index) });
    offset = match.index + match[0].length;
  }
  lines.push({ offset, text: source.slice(offset) });
  return lines;
}

export function proposeInsertion(source: string, offset: number, templates: ParsedTemplate[], remove: CodeItem[]) {
  const newline = source.match(/\r\n|\n|\r/)?.[0] ?? '\n';
  const bom = source.startsWith('\uFEFF') ? 1 : 0;
  const code = templates.map(template => template.source.replace(/\r\n|\n|\r/g, newline).trimEnd()).join(newline);
  const prefix = offset > bom && !/[\r\n]/.test(source[offset - 1]) ? newline : '';
  const ranges = [...new Map(remove.map(item => [item.start + ':' + item.end, item])).values()]
    .sort((a, b) => a.start - b.start || b.end - a.end);
  let consumed = 0;
  let inserted = false;
  let output = '';
  const addition = prefix + code + newline;
  for (const range of ranges) {
    if (range.start < consumed) throw new Error('Matching blocks overlap. Choose Duplicate or resolve them in Code Editor.');
    if (range.start < offset && offset < range.end) throw new Error('Choose a line outside the code being replaced.');
    if (!inserted && offset <= range.start) {
      output += source.slice(consumed, offset) + addition;
      consumed = offset;
      inserted = true;
    }
    output += source.slice(consumed, range.start);
    consumed = range.end;
  }
  return output + (inserted ? source.slice(consumed) : source.slice(consumed, offset) + addition + source.slice(offset));
}
