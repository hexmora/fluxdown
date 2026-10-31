import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [svelte()],
  oxc: { jsx: { development: false } },
  test: {
    environment: 'node',
    include: ['src/**/*.ssr.test.ts'],
  },
});
