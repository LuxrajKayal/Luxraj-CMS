import { parse } from 'parse5';
import config from '../../../docs/Luxraj_CMS_Working_Sheet_Config.json';

export const websites = config.website_categories;
export const defaultSelection = config.generator.current_selection;

export function pagesFor(category: string) {
  return config.page_categories.filter(page => page.category_key === 'universal' || page.category_key === category);
}

type Attributes = Record<string, string>;
export function identification(category: string, pageKey: string): Attributes | null {
  if (!websites.some(website => website.category_key === category) ||
      !pagesFor(category).some(page => page.cms_page_type_key === pageKey)) return null;
  return Object.fromEntries(Object.entries(config.generator.html_attributes).map(([name, value]) => [
    name, value.replace('{category_key}', category).replace('{cms_page_type_key}', pageKey),
  ]));
}

function attribute(name: string, value: string) {
  return name + '="' + value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;') + '"';
}

export function openingTag(attributes: Attributes) {
  return '<html ' + Object.entries(attributes).map(([name, value]) => attribute(name, value)).join('\n      ') + '>';
}

export function prepareBoilerplate(source: string, attributes: Attributes) {
  const bomLength = source.charCodeAt(0) === 0xfeff ? 1 : 0;
  const document = parse(source.slice(bomLength), { sourceCodeLocationInfo: true });
  const html = document.childNodes.find(node => 'tagName' in node && node.tagName === 'html');
  if (!html || !('attrs' in html) || !html.sourceCodeLocation?.startTag) {
    throw new Error('No explicit opening <html> tag was found.');
  }
  const { startOffset, endOffset } = html.sourceCodeLocation.startTag;
  const start = startOffset + bomLength;
  const end = endOffset + bomLength;
  const tag = source.slice(start, end);
  // Tokenize only the parser-located opening tag. Keep the original spelling and whitespace
  // of untouched attributes and recognize duplicate markers that the HTML parser drops.
  const token = /([\t\n\f\r ]+)([^\t\n\f\r "'<>/=]+)(?:[\t\n\f\r ]*=[\t\n\f\r ]*(?:"[^"]*"|'[^']*'|[^\t\n\f\r "'=<>]+))?/y;
  const remaining = new Map(Object.entries(attributes));
  const seen = new Set<string>();
  let offset = 5;
  let output = tag.slice(0, offset);
  let replacesMarkers = false;
  while (offset < tag.length) {
    const tail = tag.slice(offset);
    if (/^[\t\n\f\r ]*>$/.test(tail)) {
      const additions = [...remaining].map(([name, value]) => ' ' + attribute(name, value)).join('');
      return { source: source.slice(0, start) + output + additions + tail + source.slice(end), replacesMarkers };
    }
    token.lastIndex = offset;
    const found = token.exec(tag);
    if (!found) throw new Error('The opening <html> tag contains syntax that cannot be edited safely.');
    const [raw, whitespace, rawName] = found;
    const name = rawName.toLowerCase();
    offset = token.lastIndex;
    if (!Object.hasOwn(attributes, name) || name === 'lang') {
      output += raw;
    } else if (seen.has(name)) {
      replacesMarkers = true;
    } else {
      const current = html.attrs.find(item => item.name === name)?.value;
      if (current === attributes[name]) output += raw;
      else {
        output += whitespace + attribute(name, attributes[name]);
        replacesMarkers = true;
      }
    }
    seen.add(name);
    remaining.delete(name);
  }
  throw new Error('The opening <html> tag is incomplete.');
}
