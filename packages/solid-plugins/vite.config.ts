import { readdirSync } from 'node:fs';
import { defineConfig } from 'vite';

import { solidPackageConfig } from '../../scripts/build/solid';

const plugins = Object.fromEntries(
  readdirSync(new URL('./src/plugins', import.meta.url)).map((name) => [
    `plugins/${name}`,
    `./src/plugins/${name}/index.ts`,
  ]),
);

export default defineConfig(({ isSsrBuild }) =>
  solidPackageConfig(
    import.meta.dirname,
    {
      base: './src/base/index.ts',
      'presets/lite': './src/presets/lite/index.ts',
      'presets/full': './src/presets/full/index.ts',
      ...plugins,
    },
    !!isSsrBuild,
    ['katex/dist/katex.min.css'],
  ),
);
