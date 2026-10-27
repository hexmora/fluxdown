import { defineConfig } from '@rslib/core';
import { globSync } from 'node:fs';

import { packageConfig } from '../../rslib.shared';

const entries = Object.fromEntries(
  globSync(['plugins/*/*/index.ts', 'plugins/*/*/index.tsx', 'presets/*/index.ts'], {
    cwd: new URL('./src/', import.meta.url),
  })
    .map((path) => path.replaceAll('\\', '/'))
    .map((path) => [path.replace(/\/index\.tsx?$/, ''), `./src/${path}`]),
);

const config = packageConfig({
  entry: entries,
  jsxImportSource: 'stative',
  // These parser chains reach a browser-only entity decoder. Keep unified and
  // vfile external so their host-specific Node adapters are never bundled.
  bundleDependencies: [
    'mdast-util-from-markdown',
    'mdast-util-gfm-footnote',
    'mdast-util-gfm-strikethrough',
    'mdast-util-gfm-table',
    'mdast-util-gfm-task-list-item',
    'mdast-util-math',
    'mdast-util-to-markdown',
    'micromark-extension-gfm-footnote',
  ],
});

export default defineConfig({
  ...config,
  lib: config.lib?.map((lib) =>
    lib.format === 'cjs'
      ? {
          ...lib,
          // Native requires preserve identity and exclude unused dependency exports.
          bundle: false,
          outBase: './src',
          source: {
            entry: {
              index: ['src/**', '!src/**/__tests__/**', '!src/**/*.test.*'],
            },
          },
          plugins: [],
          tools: {},
        }
      : lib,
  ),
});
