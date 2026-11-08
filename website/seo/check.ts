import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { redirects } from './redirects';

const output = fileURLToPath(new URL('../doc_build/', import.meta.url));
const site = new URL('https://fluxdown.dev/');
const demoDirectories = ['react-lynx-demo', 'vue-lynx-demo', 'uni-app-demo'];
const frameworks = [
  'react',
  'vue',
  'svelte',
  'angular',
  'react-native',
  'react-lynx',
  'vue-lynx',
  'solid',
  'taro',
  'uni-app',
];
const scopes: Record<string, string> = {
  react: 'Fluxdown React',
  vue: 'Fluxdown Vue',
  svelte: 'Fluxdown Svelte',
  angular: 'Fluxdown Angular',
  'react-native': 'Fluxdown React Native',
  'react-lynx': 'Fluxdown React Lynx',
  'vue-lynx': 'Fluxdown Vue Lynx',
  solid: 'Fluxdown Solid',
  taro: 'Fluxdown Taro',
  'uni-app': 'Fluxdown Uni App',
  core: 'Fluxdown Core',
};

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
  assert.ok(
    !demoDirectories.some((directory) => file.startsWith(`${directory}/`)),
    `Iframe demo assets must not be indexed: ${value}`,
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
      file.endsWith('.html') && !/(^|\/)404\.html$/.test(file) && !file.startsWith('static/'),
  );

for (const directory of demoDirectories) {
  assert.ok(files.includes(`${directory}/index.html`), `Missing iframe entry: ${directory}`);
}

for (const file of redirects.keys()) {
  assert.ok(files.includes(file), `Missing legacy redirect: ${file}`);
}

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
        const canonical = links.filter((link) => link.rel === 'canonical');
        const destination = redirects.get(file);

        if (destination) {
          const target = new URL(destination, site);
          const refresh = meta.filter((item) => item['http-equiv']?.toLowerCase() === 'refresh');

          assert.ok(!sitemapUrls.has(url), `${url}: legacy redirect must not be in the sitemap`);
          assert.ok(sitemapUrls.has(target.href), `${url}: redirect target must be indexed`);
          assert.equal(canonical.length, 1, `${url}: expected exactly one canonical link`);
          assert.equal(canonical[0].href, target.href, `${url}: incorrect redirect canonical`);
          assert.equal(refresh.length, 1, `${url}: expected exactly one refresh redirect`);
          assert.equal(
            refresh[0].content,
            `0; url=${target.pathname}`,
            `${url}: incorrect redirect`,
          );
          return null;
        }

        const noindex = meta.some(
          (item) =>
            ['robots', 'googlebot'].includes(item.name?.toLowerCase()) &&
            /\b(noindex|none)\b/i.test(item.content ?? ''),
        );
        if (demoDirectories.some((directory) => file.startsWith(`${directory}/`))) {
          assert.ok(noindex, `${url}: iframe demo must declare noindex`);
        }
        if (noindex) {
          assert.ok(!sitemapUrls.has(url), `${url}: noindex page must not be in the sitemap`);
          return null;
        }

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

const sidebarTargets = new Set<string>();
let articles = 0;

for (const [url, page] of pages) {
  for (const match of page.html.matchAll(/<a\b[^>]*>/gi)) {
    const link = attributes(match[0]);
    if (!link.class?.split(/\s+/).includes('rp-sidebar-item') || !link.href) continue;

    const target = new URL(link.href, url);
    if (target.origin !== site.origin) continue;

    target.search = '';
    target.hash = '';
    if (target.pathname.endsWith('/')) target.pathname += 'index.html';
    assert.ok(pages.has(target.href), `${url}: sidebar link has no built page: ${link.href}`);
    sidebarTargets.add(target.href);
  }

  const route = new URL(url).pathname.replace(/^\/(?:zh\/)?/, '');
  if (!route.startsWith('guide/') && !route.startsWith('stative/')) continue;

  const heading = page.html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  assert.ok(heading, `${url}: article is missing its H1`);
  const headingText = decode(
    heading[1]
      .replace(/<a\b[^>]*class=(["'])[^"']*\brp-header-anchor\b[^"']*\1[^>]*>[\s\S]*?<\/a>/gi, '')
      .replace(/<[^>]+>/g, ''),
  ).trim();
  const scope = route.startsWith('stative/')
    ? 'Stative'
    : (scopes[route.split('/')[1]] ?? 'Fluxdown');
  const suffix = ` - ${scope}`;
  const articleName = headingText.endsWith(suffix)
    ? headingText.slice(0, -suffix.length)
    : headingText;
  const brand = scope === 'Stative' ? /\bStative\b/ : /\bFluxdown\b/;
  if (brand.test(articleName)) {
    assert.equal(headingText, articleName, `${url}: H1 must not repeat the library name`);
  } else {
    assert.ok(headingText.endsWith(suffix), `${url}: H1 must end with "${suffix}"`);
  }
  const title = page.head.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  assert.equal(
    title && decode(title[1]).trim(),
    headingText,
    `${url}: browser title must match the article title`,
  );
  if (route.includes('/migration/')) {
    assert.ok(
      new URL(url).pathname.startsWith('/zh/')
        ? headingText.includes(' 迁移指南 - ')
        : headingText.includes(' migration guide - '),
      `${url}: migration title must name the source library and migration guide`,
    );
  }
  articles += 1;
}

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
    if (route === 'index.html') {
      assert.ok(/markdown/i.test(title), `${url}: home title must identify Markdown content`);
    } else {
      const names = route.endsWith('/quick-start.html')
        ? { zh: '快速开始', en: 'Quick start' }
        : { zh: '流式渲染', en: 'Streaming rendering' };
      const article = locale === 'zh' ? names.zh : names.en;
      assert.equal(
        title,
        `${article} - ${scopes[route.split('/')[1]]}`,
        `${url}: incorrect scoped article title`,
      );
    }
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
    assert.ok(
      /markdown/i.test(descriptions[0].content),
      `${url}: description must identify Markdown content`,
    );
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
  `Verified ${pages.size} canonical sitemap pages, ${articles} article titles, ${sidebarTargets.size} sidebar destinations, SEO metadata for ${titles.size} priority pages, ${redirects.size} legacy redirects, and noindex for iframe demos.\n`,
);
