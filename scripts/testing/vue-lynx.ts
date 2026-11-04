import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export const vueLynxTestConfig = (root: string) =>
  defineConfig({
    plugins: [
      vueJsx({
        tsTransform: 'built-in',
        include: /packages\/vue(?:-base|-lynx)?(?:-plugins)?\/.*\.[jt]sx$/,
      }),
    ],
    oxc: { jsx: { development: false } },
    test: {
      root,
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: [path.join(import.meta.dirname, 'vue-lynx.setup.ts'), './vitest.setup.ts'],
    },
  });
