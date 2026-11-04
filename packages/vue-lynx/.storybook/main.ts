import { createRequire } from 'node:module';
import { defineMain } from 'storybook-lynx-rsbuild/node';

const require = createRequire(import.meta.url);

export default defineMain({
  stories: ['../stories/**/*.stories.ts'],
  staticDirs: [{ from: '../dist/preview', to: '/lynx' }],
  framework: { name: 'storybook-lynx-rsbuild', options: {} },
  rsbuildFinal: (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@lynx-js/web-core/client': require.resolve('@lynx-js/web-core/client'),
      },
    },
    // Workers resolve their split chunks relative to the Storybook origin.
    dev: { ...config.dev, assetPrefix: '/' },
    output: { ...config.output, assetPrefix: '/' },
  }),
});
