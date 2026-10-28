import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export const uniTestConfig = (root: string) =>
  defineConfig({
    plugins: [
      vue({
        include: /\.uvue$/,
        template: {
          compilerOptions: {
            isCustomElement: (tag) =>
              ['view', 'text', 'image', 'scroll-view', 'rich-text'].includes(tag),
          },
        },
      }),
    ],
    oxc: { jsx: { development: false } },
    test: {
      root,
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.test.ts'],
      setupFiles: ['./vitest.setup.ts'],
    },
  });
