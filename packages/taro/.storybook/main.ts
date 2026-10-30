import type { StorybookConfig } from '@storybook/react-vite';

import { mergeConfig } from 'vite';

import { taroWebAliases, taroWebDefines } from '../../../scripts/build/taro-web';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs'],
  framework: { name: '@storybook/react-vite', options: {} },
  viteFinal: (viteConfig) => {
    return mergeConfig(viteConfig, {
      define: taroWebDefines,
      resolve: {
        alias: Object.entries(taroWebAliases()).map(([name, replacement]) => ({
          find: name.endsWith('$') ? new RegExp(`^${name}`) : name,
          replacement,
        })),
        dedupe: ['react', 'react-dom'],
      },
      oxc: { jsx: { development: false } },
      optimizeDeps: { rolldownOptions: { transform: { jsx: { development: false } } } },
    });
  },
};

export default config;
