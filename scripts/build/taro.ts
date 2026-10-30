import { fileURLToPath } from 'node:url';

import { packageConfig } from '../../rslib.shared.ts';

export const taroPackageConfig = (options: Parameters<typeof packageConfig>[0]) => {
  const config = packageConfig(options);

  return {
    ...config,
    output: {
      ...config.output,
      // Renderer packages share directory names; keep their CSS modules independent.
      cssModules: { localIdentName: 'taro-[local]-[hash:base64:6]' },
    },
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@taro-prefix': fileURLToPath(
          new URL('../../packages/taro-plugins/src/styles/_prefix.scss', import.meta.url),
        ),
      },
    },
  };
};
