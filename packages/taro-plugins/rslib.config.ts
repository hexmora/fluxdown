import { defineConfig } from '@rslib/core';
import { readdirSync } from 'node:fs';

import { taroPackageConfig } from '../../scripts/build/taro';

const pluginEntries = Object.fromEntries(
  readdirSync(new URL('./src/plugins', import.meta.url), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => [`plugins/${name}`, `./src/plugins/${name}/index.ts`]),
);

const config = taroPackageConfig({
  entry: {
    base: './src/base/index.ts',
    ...pluginEntries,
    'presets/lite': './src/presets/lite/index.ts',
    'presets/full': './src/presets/full/index.ts',
  },
  react: true,
});

export default defineConfig({
  ...config,
  lib: config.lib?.map((lib) => ({
    ...lib,
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
