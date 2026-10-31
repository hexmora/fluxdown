import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  oxc: { jsx: { development: false } },
  test: {
    maxWorkers: 1,
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts'],
    exclude: ['src/**/*.ssr.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
