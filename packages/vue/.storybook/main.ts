import type { StorybookConfig } from '@storybook/vue3-vite';

import vueJsx from '@vitejs/plugin-vue-jsx';
import { resolve } from 'node:path';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  viteFinal: (viteConfig) => {
    return mergeConfig(viteConfig, {
      plugins: [
        vueJsx({
          tsTransform: 'built-in',
          include: /packages\/vue(?:-plugins)?\/.*\.[jt]sx$/,
        }),
      ],
      resolve: {
        alias: {
          '@prefix': resolve(import.meta.dirname, '../../vue-plugins/src/styles/_prefix.scss'),
        },
      },
      // Core uses stative's JSX runtime, which has no jsxDEV export.
      oxc: {
        jsx: {
          development: false,
        },
      },
      optimizeDeps: {
        rolldownOptions: {
          transform: {
            jsx: {
              development: false,
            },
          },
        },
      },
    });
  },
};

export default config;
