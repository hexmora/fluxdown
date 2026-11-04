import type { RspressPlugin } from '@rspress/core';

import { normalizeHref } from '@rspress/core';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { redirects } from './redirects';

export function seo(): RspressPlugin {
  let siteUrl: URL;

  const urls = new Set<string>();

  return {
    name: 'seo',
    beforeBuild(config) {
      siteUrl = new URL(config.base ?? '/', config.siteOrigin);
      urls.clear();
    },
    extendPageData(page) {
      const head = page.frontmatter.head ?? [];

      if (
        page.frontmatter.pageType === '404' ||
        head.some(
          ([tag, attrs]) =>
            tag === 'meta' &&
            ['robots', 'googlebot'].includes(attrs.name?.toLowerCase()) &&
            /\b(noindex|none)\b/i.test(attrs.content ?? ''),
        )
      ) {
        return;
      }

      // Match Rspress' HTML links, hreflang URLs and client-side route normalization.
      const path = normalizeHref(page.routePath, false).replace(/^\//, '');

      urls.add(new URL(path, siteUrl).href);
    },
    async afterBuild(config, isProd) {
      if (!isProd) return;

      const output = config.outDir ?? 'doc_build';
      const sortedUrls = [...urls];

      sortedUrls.sort();

      const entries = sortedUrls.map(
        (url) => `  <url><loc>${url.replaceAll('&', '&amp;')}</loc></url>`,
      );

      await writeFile(
        join(output, 'sitemap.xml'),
        [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...entries,
          '</urlset>',
          '',
        ].join('\n'),
      );

      // GitHub Pages serves static files, so preserve old links with instant HTML redirects.
      await Promise.all(
        [...redirects].map(async ([source, destination]) => {
          const target = new URL(destination, siteUrl);
          const file = join(output, source);
          const lang = source.startsWith('zh/') ? 'zh' : 'en';

          await mkdir(dirname(file), { recursive: true });
          await writeFile(
            file,
            `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <title>React Lynx Markdown - Fluxdown</title>
    <link rel="canonical" href="${target.href}" />
    <meta http-equiv="refresh" content="0; url=${target.pathname}" />
    <script>location.replace(${JSON.stringify(target.pathname)} + location.search + location.hash);</script>
  </head>
  <body><a href="${target.pathname}">React Lynx Markdown - Fluxdown</a></body>
</html>
`,
          );
        }),
      );
    },
  };
}
