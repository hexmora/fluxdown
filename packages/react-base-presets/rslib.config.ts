import { packageConfig } from '../../rslib.shared';

const config = packageConfig({
  entry: {
    base: './src/base/index.ts',
    highlight: './src/highlight/index.ts',
    'plugins/blockquote': './src/plugins/blockquote/index.ts',
    'plugins/break-line': './src/plugins/break-line/index.ts',
    'plugins/code': './src/plugins/code/index.ts',
    'plugins/emphasis': './src/plugins/emphasis/index.ts',
    'plugins/fallback': './src/plugins/fallback/index.ts',
    'plugins/heading': './src/plugins/heading/index.ts',
    'plugins/image': './src/plugins/image/index.ts',
    'plugins/link': './src/plugins/link/index.ts',
    'plugins/list': './src/plugins/list/index.ts',
    'plugins/paragraph': './src/plugins/paragraph/index.ts',
    'plugins/patch': './src/plugins/patch/index.ts',
    'plugins/strong': './src/plugins/strong/index.ts',
    'plugins/table': './src/plugins/table/index.ts',
    'plugins/tex': './src/plugins/tex/index.ts',
    render: './src/render/index.ts',
    math: './src/math/index.ts',
  },
  react: true,
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
