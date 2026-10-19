import type { StorybookConfig } from '@storybook/react-vite';

import { resolve } from 'node:path';
import { themes } from 'storybook/theming';
import { mergeConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// The manager page ships no background, so it flashes white until its theme loads. Paint the
// built-in theme backgrounds from the first frame; `manager.ts` picks the same theme from the
// system appearance that `light-dark()` resolves against here.
const managerFirstPaintStyle = `<style>
  @layer manager-boot {
    :root {
      color-scheme: light dark;
      background-color: light-dark(${themes.light.appBg}, ${themes.dark.appBg});
    }
  }
</style>`;

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  managerHead: (head) => `${head ?? ''}\n${managerFirstPaintStyle}`,
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: (viteConfig) => {
    return mergeConfig(viteConfig, {
      plugins: [svgr()],
      resolve: {
        alias: {
          '@prefix': resolve(import.meta.dirname, '../../react-presets/src/styles/_prefix.scss'),
        },
      },
      // Workspace packages use stative/jsx-runtime, which has no jsxDEV export.
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
