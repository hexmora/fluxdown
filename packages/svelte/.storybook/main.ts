import type { StorybookConfig } from '@storybook/svelte-vite';

import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.ts'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/svelte-vite',
    options: {},
  },
  viteFinal: (viteConfig) => {
    return mergeConfig(viteConfig, {
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
  },
};

export default config;
