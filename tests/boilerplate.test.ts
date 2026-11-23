import { expect, test } from 'vitest';
import { defaultSelection, identification, openingTag, pagesFor, prepareBoilerplate } from '../src/features/code-injector/boilerplate';
import config from '../docs/Luxraj_CMS_Working_Sheet_Config.json';

test('filters page options by category and reproduces the JSON generator output', () => {
  expect(pagesFor('blog').map(page => page.cms_page_type_key)).toContain('BlogPosting');
  expect(pagesFor('blog').map(page => page.cms_page_type_key)).toContain('QAPage');
  expect(identification('blog', 'NewsArticle')).toBeNull();
  expect(identification('universal', 'QAPage')).toBeNull();
  expect(openingTag(identification(defaultSelection.category_key, defaultSelection.cms_page_type_key)!))
    .toBe(config.generator.current_boilerplate);
});

test('updates only the real opening tag and preserves non-CMS attributes and line endings', () => {
  const source = '\uFEFF<!DOCTYPE html>\r\n<!-- <html data-cms-seo="false"> -->\r\n' +
    '<HTML LANG=fr title="a > b" data-CMS-SEO=false data-cms-seo="old" data-cms-seo-type="Old" class = "keep" >' +
    '\r\n<head></head><body><script>const x = "<html>";</script></body></HTML>';
  const attrs = identification('blog', 'BlogPosting')!;
  const edited = prepareBoilerplate(source, attrs);
  expect(edited.replacesMarkers).toBe(true);
  expect(edited.source).toBe(source.replace(
    '<HTML LANG=fr title="a > b" data-CMS-SEO=false data-cms-seo="old" data-cms-seo-type="Old" class = "keep" >',
    '<HTML LANG=fr title="a > b" data-cms-seo="true" data-cms-seo-type="BlogPosting" class = "keep" data-cms-website="blog" >',
  ));
  expect(prepareBoilerplate(edited.source, attrs)).toEqual({ source: edited.source, replacesMarkers: false });
});

test('adds the configured language when absent and refuses fragments or unsafe root syntax', () => {
  const attrs = identification('blog', 'BlogPosting')!;
  expect(prepareBoilerplate('<html><body>Example</body></html>', attrs).source)
    .toBe('<html lang="en" data-cms-seo="true" data-cms-website="blog" data-cms-seo-type="BlogPosting"><body>Example</body></html>');
  expect(() => prepareBoilerplate('<!-- <html> --><body>Fragment</body>', attrs)).toThrow('No explicit opening');
  expect(() => prepareBoilerplate('<html/>', attrs)).toThrow('cannot be edited safely');
});
