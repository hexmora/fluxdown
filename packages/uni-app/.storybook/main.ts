import type { StorybookConfig } from '@storybook/vue3-vite';

import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.ts'],
  addons: ['@storybook/addon-docs'],
  framework: { name: '@storybook/vue3-vite', options: {} },
  staticDirs: [{ from: '../playground/dist/build/h5', to: '/uni-app' }],
  viteFinal: (viteConfig) => {
    return mergeConfig(viteConfig, {
      define: {
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
      },
    });
  },
};

export default config;
