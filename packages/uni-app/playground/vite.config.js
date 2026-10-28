import { transformSync } from '@babel/core';
import unicodeProperty from '@babel/plugin-transform-unicode-property-regex';
import uni from '@dcloudio/vite-plugin-uni';
import commonjs from '@rollup/plugin-commonjs';
import { existsSync, realpathSync } from 'node:fs';
import { transformWithEsbuild } from 'vite';

export default {
  base: './',
  plugins: [
    {
      name: 'stative-workspace-source',
      enforce: 'pre',
      async resolveId(source, importer, options) {
        if (!importer || source.startsWith('\0')) {
          return null;
        }

        const filename = importer.split('?')[0];

        const real = existsSync(filename) ? realpathSync(filename) : importer;

        const resolved = await this.resolve(source, real, { ...options, skipSelf: true });

        if (!resolved || resolved.external) {
          return resolved;
        }

        const [path, query] = resolved.id.split('?');

        return existsSync(path)
          ? { ...resolved, id: realpathSync(path) + (query ? `?${query}` : '') }
          : resolved;
      },
      transform(code, id) {
        if (!id.endsWith('.tsx') || !code.includes('@jsxImportSource stative')) {
          return null;
        }

        const source = code.replace(/\/\*\*\s*\*\s*@jsxImportSource stative\s*\*\//, '');

        return transformWithEsbuild(source, id, {
          loader: 'tsx',
          jsx: 'automatic',
          jsxImportSource: 'stative',
          jsxDev: false,
        });
      },
    },
    uni.default(),
    ...(process.env.UNI_PLATFORM === 'h5' ? [] : [commonjs()]),
    {
      name: 'vapor-unicode-properties',
      enforce: 'pre',
      transform(code, id) {
        if (!id.endsWith('.js') || !code.includes('\\p{')) {
          return null;
        }

        return transformSync(code, {
          configFile: false,
          babelrc: false,
          plugins: [unicodeProperty],
          sourceMaps: true,
          filename: id,
        });
      },
    },
  ],
};
