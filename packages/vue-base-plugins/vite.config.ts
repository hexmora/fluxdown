import { readdirSync } from 'node:fs';

import { vuePackageConfig } from '../../scripts/build/vue';

const plugins = Object.fromEntries(
  readdirSync(new URL('./src/plugins', import.meta.url), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => [`plugins/${name}`, `./src/plugins/${name}/index.ts`]),
);

export default vuePackageConfig(import.meta.dirname, {
  base: './src/base/index.ts',
  ...plugins,
});
