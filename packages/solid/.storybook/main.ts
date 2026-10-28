import type { StorybookConfig } from 'storybook-solidjs-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: 'storybook-solidjs-vite',
    options: {
      // Automatic docgen also scans stative JSX and injects invalid re-export references.
      docgen: false,
      builder: {
        viteConfigPath: '.storybook/vite.config.ts',
      },
    },
  },
};

export default config;
