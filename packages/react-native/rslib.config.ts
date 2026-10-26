import { defineConfig } from '@rslib/core';

import { packageConfig } from '../../rslib.shared';
import { reactCjsPlugin } from '../../scripts/build/react-cjs';

const entry = {
  raw: './src/packs/raw/index.tsx',
  lite: './src/packs/lite/index.tsx',
  full: './src/packs/full/index.tsx',
};

const config = packageConfig({ entry, jsxImportSource: 'react' });

export default defineConfig({
  ...config,
  lib: config.lib?.map((lib) => ({
    ...lib,
    ...(lib.format === 'cjs'
      ? {
          // Shared CJS runtimes would pull Full's lazy engines into Lite.
          bundle: false,
          outBase: './src',
          source: {
            entry: {
              index: ['src/**', '!src/**/__tests__/**', '!src/**/*.test.*', '!src/**/*.stories.*'],
            },
          },
          plugins: [reactCjsPlugin(entry)],
          tools: {},
        }
      : {}),
  })),
});
