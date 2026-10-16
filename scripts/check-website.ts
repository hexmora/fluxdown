import assert from 'node:assert/strict';
import { lstat, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const output = path.join(root, 'website/doc_build');
const manifest = JSON.parse(await readFile(path.join(root, 'website/package.json'), 'utf8'));
const site = new URL(manifest.homepage);
const files = await readdir(output, { recursive: true });
// Pages artifacts cannot contain symlinks. Check the same output we upload.
const entries = await Promise.all(
  files.map(async (file) => {
    const stat = await lstat(path.join(output, file));
    assert.ok(!stat.isSymbolicLink(), `Symlink in output: ${file}`);
    return { file, isFile: stat.isFile() };
  }),
);
const staticFiles = new Set(entries.filter((entry) => entry.isFile).map((entry) => entry.file));
const htmlFiles = [...staticFiles].filter((file) => file.endsWith('.html'));
const errors = new Set<string>();

// Every source page must be directly readable without a rewrite or SPA fallback.
await Promise.all(
  ['en', 'zh'].map(async (locale) => {
    const sources = await readdir(path.join(root, 'website/docs', locale), { recursive: true });
    for (const source of sources.filter((file) => /\.mdx?$/.test(file))) {
      const page = `${locale === 'en' ? '' : 'zh/'}${source.replace(/\.mdx?$/, '.html')}`;
      assert.ok(htmlFiles.includes(page), `Missing static page: ${page}`);
    }
  }),
);
assert.ok(htmlFiles.includes('404.html'), 'Missing static 404 page');

const pages = await Promise.all(
  htmlFiles.map(async (file) => ({ file, html: await readFile(path.join(output, file), 'utf8') })),
);

let checkedLinks = 0;
function checkTarget(file: string, target: string, pageUrl: URL) {
  if (!target || target.startsWith('#')) return;
  const url = new URL(target, pageUrl);
  if (url.origin !== site.origin) return;
  if (!url.pathname.startsWith(site.pathname)) {
    errors.add(`${file}: URL escapes the Pages base path: ${target}`);
    return;
  }
  const relativePath = decodeURIComponent(url.pathname.slice(site.pathname.length));
  const assetPath = path.join(relativePath, url.pathname.endsWith('/') ? 'index.html' : '');
  if (staticFiles.has(assetPath)) {
    checkedLinks++;
  } else {
    errors.add(`${file}: missing static target: ${target}`);
  }
}

for (const { file, html } of pages) {
  const pageUrl = new URL(file, site);
  for (const match of html.matchAll(/\b(?:href|src)=(['"])(.*?)\1/g)) {
    checkTarget(file, match[2].replaceAll('&amp;', '&'), pageUrl);
  }
}

// Search links are created in the browser, so they are absent from the HTML.
await Promise.all(
  ['en', 'zh'].map(async (locale) => {
    const file = files.find((entry) => entry.startsWith(`static/search_index.${locale}.`));
    assert.ok(file, `Missing ${locale} search index`);
    const index: { routePath: string }[] = JSON.parse(
      await readFile(path.join(output, file), 'utf8'),
    );
    assert.ok(index.length > 0, `Empty ${locale} search index`);
    for (const page of index) {
      checkTarget(file, `${site.pathname}${page.routePath.replace(/^\//, '')}`, site);
    }
  }),
);

assert.equal(errors.size, 0, `Static website validation failed:\n${[...errors].join('\n')}`);
process.stdout.write(
  `Verified ${htmlFiles.length} static pages and ${checkedLinks} local links/assets.\n`,
);
