import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export const vueTestConfig = (root: string) =>
  defineConfig({
    plugins: [
      vueJsx({ tsTransform: 'built-in', include: /packages\/vue(?:-plugins)?\/.*\.[jt]sx$/ }),
    ],
    oxc: { jsx: { development: false } },
    resolve: {
      alias: {
        '@prefix': path.resolve(root, '../vue-plugins/src/styles/_prefix.scss'),
      },
    },
    test: {
      root,
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['./vitest.setup.ts'],
    },
  });
