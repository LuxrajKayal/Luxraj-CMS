import { expect, test } from 'vitest';
import { compareTemplates, inspectSource, presence, proposeInsertion, readTemplate, sourceLines, type ParsedTemplate } from '../src/features/code-injector/code-matching';

function template(kind: ParsedTemplate['kind'], source: string): ParsedTemplate {
  return { kind, source, id: kind, name: kind, items: readTemplate(kind, source) };
}

test('matches HTML metadata by identity, ignores comments, and reports complete and partial presence', () => {
  const card = template('html', '<title>New</title><meta name="description" content="New">');
  const source = '\uFEFF<!doctype html>\r\n<html><head>\r\n<title>Old</title>\r\n<!-- <meta name="description"> -->\r\n</head></html>';
  const existing = inspectSource('index.HTM', source).items;
  expect(card.items).toHaveLength(2);
  expect(presence([card], existing)).toBe('partial');
  const assessment = compareTemplates([card], existing);
  expect(assessment.matches.map(item => item.label)).toEqual(['<title> singleton']);
  const inserted = proposeInsertion(source, sourceLines(source)[3].offset, [card], assessment.matches);
  expect(inserted).not.toContain('<title>Old</title>');
  expect(inserted).toContain('<!-- <meta name="description"> -->');
  expect(inserted.startsWith('\uFEFF<!doctype html>\r\n')).toBe(true);
  expect(presence([card], inspectSource('index.HTM', inserted).items)).toBe('complete');
});

test('matches named scripts across formatting and CSS constructs without removing unrelated syntax', () => {
  const script = template('script', 'const theme = "dark";');
  const js = 'const theme = "light", unrelated = 42;\n';
  const mixed = compareTemplates([script], inspectSource('app.js', js).items);
  expect(mixed.matches[0].label).toBe('JavaScript theme');
  expect(mixed.blocked).toBe(true);
  const css = template('css', '.card { color: red }');
  const old = '.card{color:blue}\n.keep { padding: 2px }\n';
  const existing = compareTemplates([css], inspectSource('styles.css', old).items);
  expect(existing.blocked).toBe(false);
  expect(proposeInsertion(old, 0, [css], existing.matches)).toContain('\n.keep { padding: 2px }\n');
  expect(proposeInsertion(old, 0, [css], existing.matches)).not.toContain('color:blue');
  expect(compareTemplates([css], inspectSource('styles.css', '.card { color:blue; display:grid }').items).blocked).toBe(true);
});

test('detects real JSON-LD graph types, protects mixed scripts, and checks embedded CSS and JS', () => {
  const partial = template('script', '<script type="application/ld+json">{"@type":"BlogPosting"}</script>');
  const page = '<html><head><script type="application/ld+json">' +
    '{"@graph":[{"@type":"https://schema.org/BlogPosting"},{"@type":"Person"}]}' +
    '</script><style>.x { color: red }</style><script>const app = 1;</script></head></html>';
  expect(compareTemplates([partial], inspectSource('index.html', page).items).blocked).toBe(true);
  expect(presence([partial], inspectSource('app.js', 'const text = \'{"@type":"BlogPosting"}\';').items)).toBe('absent');
  expect(presence([template('css', '.x { color: blue }')], inspectSource('index.html', page).items)).toBe('complete');
  expect(presence([template('script', 'const app = 9;')], inspectSource('index.html', page).items)).toBe('complete');
});

test('detects collisions within an instant group and keeps the explicit insertion location', () => {
  const first = template('html', '<title>A</title>');
  const second = template('html', '<title>B</title>');
  expect(compareTemplates([first, second], []).repeated).toBe(true);
  const source = 'first\r\nsecond';
  expect(proposeInsertion(source, sourceLines(source)[1].offset, [first], [])).toBe('first\r\n<title>A</title>\r\nsecond');
  expect(proposeInsertion(source, source.length, [first], [])).toBe('first\r\nsecond\r\n<title>A</title>\r\n');
});
