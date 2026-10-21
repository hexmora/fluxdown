import { packageConfig } from '../../rslib.shared';

export default packageConfig({
  entry: {
    raw: './src/packs/raw/index.tsx',
    lite: './src/packs/lite/index.tsx',
    full: './src/packs/full/index.tsx',
  },
  react: true,
});
