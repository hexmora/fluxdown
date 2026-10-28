import path from 'node:path';
import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export const solidTestConfig = (root: string) => {
  return defineConfig({
    test: {
      projects: [false, true].map((server) => {
        return {
          root,
          plugins: [solid({ ssr: server, include: /packages\/solid(?:-plugins)?\/.*\.[jt]sx$/ })],
          oxc: { jsx: { development: false } },
          resolve: {
            conditions: [server ? 'node' : 'browser', 'development'],
            alias: {
              '@prefix': path.resolve(root, '../solid-plugins/src/styles/_prefix.scss'),
            },
          },
          test: {
            name: `${path.basename(root)}:${server ? 'server' : 'client'}`,
            environment: server ? 'node' : 'jsdom',
            globals: true,
            include: [server ? 'src/**/*.ssr.test.{ts,tsx}' : 'src/**/*.test.{ts,tsx}'],
            exclude: server ? [] : ['src/**/*.ssr.test.{ts,tsx}'],
            setupFiles: server ? [] : ['./vitest.setup.ts'],
          },
        };
      }),
    },
  });
};
