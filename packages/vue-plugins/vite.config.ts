import { readdirSync } from 'node:fs';

import { vuePackageConfig } from '../../scripts/build/vue';

const plugins = Object.fromEntries(
  readdirSync(new URL('./src/plugins', import.meta.url)).map((name) => [
    `plugins/${name}`,
    `./src/plugins/${name}/index.ts`,
  ]),
);

export default vuePackageConfig(
  import.meta.dirname,
  {
    base: './src/base/index.ts',
    'presets/lite': './src/presets/lite/index.ts',
    'presets/full': './src/presets/full/index.ts',
    ...plugins,
  },
  ['katex/dist/katex.min.css'],
);
