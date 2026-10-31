import type { StorybookConfig } from '@storybook/svelte-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.ts'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/svelte-vite',
    options: {},
  },
};

export default config;
