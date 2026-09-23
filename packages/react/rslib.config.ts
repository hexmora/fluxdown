import { defineConfig } from '@rslib/core';

import { packageConfig } from '../../rslib.shared';

const config = packageConfig({
  entry: {
    index: './src/index.tsx',
  },
  react: true,
});

export default defineConfig({
  ...config,
  lib: config.lib?.map((lib) => ({
    ...lib,
    output: {
      ...lib.output,
      copy: [
        {
          from: './src/types/plugins.d.ts',
          to: `types/plugins.d.${lib.format === 'cjs' ? 'cts' : 'ts'}`,
        },
      ],
    },
  })),
});
