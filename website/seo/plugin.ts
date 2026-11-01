import type { RspressPlugin } from '@rspress/core';

import { normalizeHref } from '@rspress/core';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

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

      const sortedUrls = [...urls];

      sortedUrls.sort();

      const entries = sortedUrls.map(
        (url) => `  <url><loc>${url.replaceAll('&', '&amp;')}</loc></url>`,
      );

      await writeFile(
        join(config.outDir ?? 'doc_build', 'sitemap.xml'),
        [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...entries,
          '</urlset>',
          '',
        ].join('\n'),
      );
    },
  };
}
