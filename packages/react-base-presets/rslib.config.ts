import { packageConfig } from '../../rslib.shared';

const config = packageConfig({
  entry: {
    base: './src/base/index.ts',
    render: './src/render/index.ts',
    math: './src/math/index.ts',
  },
  jsxImportSource: 'react',
});

export default {
  ...config,
  output: {
    ...config.output,
    /**
     * Resolve MathJax's package imports at build time for Metro consumers.
     */
    autoExternal: { exclude: [/^@mathjax\//, 'mhchemparser'] },
  },
};
