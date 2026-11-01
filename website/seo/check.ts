import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(new URL('../doc_build/', import.meta.url));
const site = new URL('https://hexmora.github.io/fluxdown/');
const frameworks = [
  'react',
  'vue',
  'svelte',
  'angular',
  'react-native',
  'lynx',
  'solid',
  'taro',
  'uni-app',
];

function decode(value: string): string {
  const entities: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };

  return value.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (entity, name: string) => {
    if (name.startsWith('#')) {
      const hex = name[1].toLowerCase() === 'x';
      return String.fromCodePoint(Number.parseInt(name.slice(hex ? 2 : 1), hex ? 16 : 10));
    }

    return entities[name.toLowerCase()] ?? entity;
  });
}

function attributes(tag: string): Record<string, string> {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*(['"])(.*?)\2/gs)].map((match) => [
      match[1].toLowerCase(),
      decode(match[3]),
    ]),
  );
}

function pageFile(value: string): string {
  assert.ok(value.startsWith(site.href), `Expected an absolute site URL: ${value}`);
  const url = new URL(value);
  assert.equal(url.origin, site.origin, `Unexpected sitemap origin: ${value}`);
  assert.ok(url.pathname.startsWith(site.pathname), `URL escapes the site base: ${value}`);
  assert.equal(url.href, value, `URL is not normalized: ${value}`);
  assert.equal(url.search + url.hash, '', `Page URL has a query or fragment: ${value}`);
  assert.ok(url.pathname.endsWith('.html'), `Expected a canonical HTML URL: ${value}`);

  const file = decodeURIComponent(url.pathname.slice(site.pathname.length));
  assert.ok(!file.split('/').includes('..'), `URL escapes the build output: ${value}`);
  assert.ok(!/(^|\/)404\.html$/.test(file), `404 page must not be indexed: ${value}`);
  assert.ok(!file.startsWith('lynx-demo/'), `Lynx iframe assets must not be indexed: ${value}`);

  assert.ok(
    !file.startsWith('uni-app-demo/'),
    `uni-app iframe assets must not be indexed: ${value}`,
  );

  assert.ok(!file.startsWith('static/'), `Static assets must not be indexed: ${value}`);
  return file;
}

const sitemap = await readFile(path.join(output, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => decode(match[1]));
const sitemapUrls = new Set(urls);
assert.ok(urls.length, 'The sitemap has no page URLs');
assert.equal(sitemapUrls.size, urls.length, 'The sitemap contains duplicate URLs');
urls.forEach(pageFile);

const files = (await readdir(output, { recursive: true }))
  .map((file) => file.split(path.sep).join('/'))
  .filter(
    (file) =>
      file.endsWith('.html') &&
      !/(^|\/)404\.html$/.test(file) &&
      !file.startsWith('lynx-demo/') &&
      !file.startsWith('uni-app-demo/') &&
      !file.startsWith('static/'),
  );

const pages = new Map(
  (
    await Promise.all(
      files.map(async (file) => {
        const url = new URL(file, site).href;
        const html = await readFile(path.join(output, file), 'utf8');
        const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
        assert.ok(head, `${url}: missing head`);

        const links = [...head.matchAll(/<link\b[^>]*>/gi)].map((match) => attributes(match[0]));
        const meta = [...head.matchAll(/<meta\b[^>]*>/gi)].map((match) => attributes(match[0]));
        const noindex = meta.some(
          (item) =>
            ['robots', 'googlebot'].includes(item.name?.toLowerCase()) &&
            /\b(noindex|none)\b/i.test(item.content ?? ''),
        );
        if (noindex) {
          assert.ok(!sitemapUrls.has(url), `${url}: noindex page must not be in the sitemap`);
          return null;
        }

        const canonical = links.filter((link) => link.rel === 'canonical');
        const social = meta.filter((item) => item.property === 'og:url');
        assert.equal(canonical.length, 1, `${url}: expected exactly one canonical link`);
        assert.equal(canonical[0].href, url, `${url}: canonical differs from the built page URL`);
        assert.equal(social.length, 1, `${url}: expected exactly one og:url`);
        assert.equal(social[0].content, url, `${url}: og:url differs from the canonical`);

        return [url, { html, head, links, meta }] as const;
      }),
    )
  ).filter((page) => page !== null),
);
assert.deepEqual(
  new Set(pages.keys()),
  sitemapUrls,
  'The sitemap must contain every indexable built page and no other URLs',
);

const routes = [
  'index.html',
  ...frameworks.flatMap((framework) => [
    `guide/${framework}/quick-start.html`,
    `guide/${framework}/streaming.html`,
  ]),
];
const titles = new Set<string>();

for (const route of routes) {
  const translations = {
    en: new URL(route, site).href,
    zh: new URL(`zh/${route}`, site).href,
  };

  for (const [locale, url] of Object.entries(translations)) {
    const page = pages.get(url);
    assert.ok(page, `${url}: priority page is missing from the sitemap`);
    const titleTags = [...page.head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
    assert.equal(titleTags.length, 1, `${url}: expected exactly one title`);
    const title = decode(titleTags[0][1]).trim();
    assert.ok(/markdown/i.test(title), `${url}: title must identify Markdown content`);
    assert.ok(/fluxdown/i.test(title), `${url}: title must identify Fluxdown`);
    const framework = route.split('/')[1]?.replace('-', ' ');
    assert.ok(
      !framework || title.toLowerCase().replaceAll('-', ' ').includes(framework),
      `${url}: title omits its framework`,
    );
    assert.ok(!titles.has(title), `${url}: duplicate priority-page title: ${title}`);
    titles.add(title);

    const descriptions = page.meta.filter((item) => item.name === 'description');
    assert.equal(descriptions.length, 1, `${url}: expected exactly one description`);
    assert.ok(descriptions[0].content?.trim(), `${url}: empty description`);
    const htmlTag = page.html.match(/<html\b[^>]*>/i)?.[0] ?? '';
    assert.equal(attributes(htmlTag).lang, locale, `${url}: incorrect HTML language`);

    const alternates = page.links.filter((link) => link.rel === 'alternate' && link.hreflang);
    for (const [language, target] of Object.entries(translations)) {
      const matching = alternates.filter((link) => link.hreflang === language);
      assert.equal(matching.length, 1, `${url}: expected one ${language} hreflang link`);
      assert.equal(matching[0].href, target, `${url}: incorrect ${language} hreflang target`);
    }
    for (const alternate of alternates) {
      assert.ok(
        pages.has(alternate.href),
        `${url}: hreflang target has no canonical sitemap page: ${alternate.href}`,
      );
    }
  }
}

process.stdout.write(
  `Verified ${pages.size} canonical sitemap pages and SEO metadata for ${titles.size} priority pages.\n`,
);
