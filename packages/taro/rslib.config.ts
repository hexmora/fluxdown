import { taroPackageConfig } from '../../scripts/build/taro';

export default taroPackageConfig({
  entry: {
    raw: './src/packs/raw/index.tsx',
    lite: './src/packs/lite/index.tsx',
    full: './src/packs/full/index.tsx',
  },
  react: true,
});
