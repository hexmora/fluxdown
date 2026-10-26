import { packageConfig } from '../../rslib.shared';

export default packageConfig({
  entry: {
    index: './src/index.ts',
  },
  jsxImportSource: 'stative',
  // Resolve the parser's entity decoder before a DOM-free host selects browser exports.
  bundleDependencies: ['remark-parse'],
});
