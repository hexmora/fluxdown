import { packageConfig } from '../../rslib.shared';

export default packageConfig({
  entry: {
    index: './src/packs/index.tsx',
  },
  jsxImportSource: 'react',
});
