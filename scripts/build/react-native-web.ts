import type { RsbuildPlugin } from '@rsbuild/core';

import path from 'node:path';

/** Resolve native primitives and third-party platform entries for web consumers. */
export function reactNativeWebPlugin(directory: string): RsbuildPlugin {
  const nativeWeb = path.join(directory, 'node_modules/react-native-web');

  return {
    name: 'fluxdown:react-native-web',
    setup(api) {
      api.modifyRspackConfig((config, { rspack }) => {
        config.resolve ??= {};

        config.resolve.extensions = [
          '.web.tsx',
          '.web.ts',
          '.web.jsx',
          '.web.js',
          ...(config.resolve.extensions ?? []),
        ];

        config.resolve.alias = {
          ...config.resolve.alias,
          'react-native$': nativeWeb,
          '@react-native/assets-registry/registry$': path.join(nativeWeb, 'asset-registry.js'),
        };

        // react-native-svg 15.16 imports this module inside an Android-only
        // sound branch. Web bundlers still traverse its native TurboModule.
        config.plugins ??= [];

        config.plugins.push(
          new rspack.IgnorePlugin({
            resourceRegExp: /NativeSvgSoundModule$/,
            contextRegExp: /react-native-svg/,
          }),
        );
      });
    },
  };
}
