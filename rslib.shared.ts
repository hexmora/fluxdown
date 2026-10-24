import { pluginLess } from '@rsbuild/plugin-less';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { defineConfig } from '@rslib/core';
import { fileURLToPath } from 'node:url';

import { browserStylesPlugin, styleChunkName } from './scripts/build/browser-styles.ts';
import { reactCjsPlugin } from './scripts/build/react-cjs.ts';
import { staticCjsChunksPlugin } from './scripts/build/static-cjs-chunks.ts';

interface PackageOptions {
  entry: Record<string, string>;
  react?: boolean;
  jsxImportSource?: string;
}

export function packageConfig({ entry, react, jsxImportSource }: PackageOptions) {
  return defineConfig({
    source: { tsconfigPath: './tsconfig.build.json' },
    lib: [
      {
        format: 'esm',
        source: { entry },
        // Preserve shared declaration modules: bundling each entry duplicates
        // stative's unique-symbol brands and makes its JSX types incompatible.
        dts: { autoExtension: true },
        output: { distPath: './dist/esm' },
        plugins: react ? [pluginSvgr(), browserStylesPlugin(Object.keys(entry), 'esm')] : [],
      },
      {
        format: 'cjs',
        source: { entry },
        dts: { autoExtension: true },
        output: { distPath: './dist/cjs' },
        plugins: react
          ? [pluginSvgr({ query: /react|^$/ }), reactCjsPlugin(entry)]
          : [staticCjsChunksPlugin()],
        ...(react
          ? {
              // A shared CJS runtime makes every entry reference every lazy
              // engine. Native requires retain both isolation and module identity.
              bundle: false,
              outBase: './src',
              source: {
                entry: {
                  index: [
                    'src/**',
                    '!src/**/__tests__/**',
                    '!src/**/*.test.*',
                    '!src/**/*.stories.*',
                  ],
                },
              },
            }
          : Object.keys(entry).length > 1
            ? {
                tools: {
                  rspack: {
                    optimization: {
                      // Entry points must share Symbols, classes and React contexts.
                      runtimeChunk: { name: 'rslib-runtime' },
                      splitChunks: {
                        cacheGroups: {
                          shared: {
                            name: 'shared',
                            test: /[\\/]src[\\/].*\.[cm]?[jt]sx?$/,
                            chunks: 'all',
                            minChunks: 2,
                            minSize: 0,
                            enforce: true,
                          },
                        },
                      },
                    },
                  },
                },
              }
            : {}),
      },
    ],
    syntax: 'es2022',
    output: { target: react ? 'web' : 'node' },
    plugins: [
      ...(react || jsxImportSource
        ? [pluginReact({ swcReactOptions: { importSource: jsxImportSource, development: false } })]
        : []),
      ...(react ? [pluginSass(), pluginLess()] : []),
    ],
    ...(react
      ? {
          resolve: {
            alias: {
              '@prefix': fileURLToPath(
                new URL('./packages/react-plugins/src/styles/_prefix.scss', import.meta.url),
              ),
            },
          },
        }
      : {}),
    tools: {
      // Rslib does not infer this TypeScript option for SWC. Assignment breaks
      // fields such as `static name` and inherited accessor properties.
      swc: { jsc: { transform: { useDefineForClassFields: true } } },
      ...(react
        ? {
            // Browser wrappers import only each entry's reachable styles,
            // including lazy components. Node entries remain CSS-free for SSR.
            cssExtract: { pluginOptions: { runtime: false } },
            rspack: {
              optimization: {
                splitChunks: {
                  cacheGroups: {
                    styles: {
                      name: styleChunkName,
                      type: 'css/mini-extract',
                      chunks: 'all',
                      enforce: true,
                    },
                  },
                },
              },
            },
          }
        : {}),
    },
  });
}
