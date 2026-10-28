import type { UserConfig } from 'vite';

import vueJsx from '@vitejs/plugin-vue-jsx';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { browserStyles, packageDeclarations } from './vite.ts';

export const vuePackageConfig = (
  root: string,
  entries: Record<string, string>,
  stylesheets: readonly string[] = [],
): UserConfig => {
  const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

  const dependencies = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies });

  return {
    plugins: [
      vueJsx({ tsTransform: 'built-in', include: /packages\/vue(?:-plugins)?\/.*\.[jt]sx$/ }),
      browserStyles(stylesheets),
      packageDeclarations(root),
    ],
    resolve: { alias: { '@prefix': path.resolve(root, '../vue-plugins/src/styles/_prefix.scss') } },
    oxc: { jsx: { development: false } },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: false,
      cssCodeSplit: true,
      lib: { entry: entries },
      rolldownOptions: {
        external: (id) =>
          dependencies.some((dependency) => id === dependency || id.startsWith(`${dependency}/`)),
        output: [
          {
            format: 'es',
            dir: 'dist/esm',
            entryFileNames: '[name].js',
            chunkFileNames: 'chunks/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash][extname]',
          },
          {
            format: 'cjs',
            dir: 'dist/cjs',
            entryFileNames: '[name].cjs',
            chunkFileNames: 'chunks/[name]-[hash].cjs',
            assetFileNames: 'assets/[name]-[hash][extname]',
          },
        ],
      },
    },
  };
};
