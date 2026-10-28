import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.ts'],
  addons: ['@storybook/addon-docs'],
  framework: { name: '@storybook/vue3-vite', options: {} },
  staticDirs: [{ from: '../playground/dist/build/h5', to: '/uni-app' }],
};

export default config;
