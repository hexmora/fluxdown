import type { UserConfig } from 'vite';

import { readFileSync } from 'node:fs';
import path from 'node:path';
import solid from 'vite-plugin-solid';

import { browserStyles, packageDeclarations } from './vite.ts';

export const solidPackageConfig = (
  root: string,
  entries: Record<string, string>,
  server: boolean,
  stylesheets: readonly string[] = [],
): UserConfig => {
  const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

  const dependencies = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies });

  return {
    plugins: [
      solid({ ssr: true, include: /packages\/solid(?:-plugins)?\/.*\.[jt]sx$/ }),
      ...(!server ? [browserStyles(stylesheets), packageDeclarations(root)] : []),
    ],
    resolve: {
      alias: { '@prefix': path.resolve(root, '../solid-plugins/src/styles/_prefix.scss') },
    },
    oxc: { jsx: { development: false } },
    build: {
      outDir: 'dist',
      emptyOutDir: !server,
      minify: false,
      cssCodeSplit: true,
      lib: { entry: entries },
      rolldownOptions: {
        external: (id) =>
          dependencies.some((dependency) => id === dependency || id.startsWith(`${dependency}/`)),
        output: [
          {
            format: 'es',
            dir: server ? 'dist/esm/server' : 'dist/esm',
            entryFileNames: '[name].js',
            chunkFileNames: 'chunks/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash][extname]',
          },
          {
            format: 'cjs',
            dir: server ? 'dist/cjs/server' : 'dist/cjs',
            entryFileNames: '[name].cjs',
            chunkFileNames: 'chunks/[name]-[hash].cjs',
            assetFileNames: 'assets/[name]-[hash][extname]',
          },
        ],
      },
    },
  };
};
