import { vuePackageConfig } from '../../scripts/build/vue';

export default vuePackageConfig(import.meta.dirname, {
  index: './src/packs/index.tsx',
});
