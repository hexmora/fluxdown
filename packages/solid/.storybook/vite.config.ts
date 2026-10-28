import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid({ include: /packages\/solid(?:-plugins)?\/.*\.[jt]sx$/ })],
  resolve: {
    alias: {
      '@prefix': resolve(import.meta.dirname, '../../solid-plugins/src/styles/_prefix.scss'),
    },
  },
  // Core uses stative's JSX runtime, which has no jsxDEV export.
  oxc: { jsx: { development: false } },
  optimizeDeps: {
    rolldownOptions: {
      transform: {
        jsx: { development: false },
      },
    },
  },
});
