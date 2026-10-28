import { vuePackageConfig } from '../../scripts/build/vue';

export default vuePackageConfig(
  import.meta.dirname,
  {
    raw: './src/packs/raw/index.tsx',
    lite: './src/packs/lite/index.tsx',
    full: './src/packs/full/index.tsx',
  },
  ['@fluxdown/vue-plugins/styles.css'],
);
