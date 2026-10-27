import { defineConfig } from '@rslib/core';
import { readdirSync } from 'node:fs';

import { packageConfig } from '../../rslib.shared';
import { reactCjsPlugin } from '../../scripts/build/react-cjs';

const pluginEntries = Object.fromEntries(
  readdirSync(new URL('./src/plugins', import.meta.url), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => [`plugins/${name}`, `./src/plugins/${name}/index.ts`]),
);

const entry = {
  base: './src/base/index.ts',
  ...pluginEntries,
  'presets/lite': './src/presets/lite/index.ts',
  'presets/full': './src/presets/full/index.ts',
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
    output: {
      ...lib.output,
      copy: [
        {
          from: './src/typings/plugins/plugins.d.ts',
          to: `typings/plugins/plugins.d.${lib.format === 'cjs' ? 'cts' : 'ts'}`,
          transform: (content: Buffer) =>
            content
              .toString()
              .replace(
                /import '(\.\.\/\.\.\/plugins\/[^']+)';/g,
                `import '$1/index.${lib.format === 'cjs' ? 'cjs' : 'js'}';`,
              ),
        },
      ],
    },
  })),
});
