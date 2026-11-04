import { defineMain } from 'storybook-lynx-rsbuild/node';

export default defineMain({
  stories: ['../stories/**/*.stories.ts'],
  staticDirs: [{ from: '../dist/preview', to: '/lynx' }],
  framework: { name: 'storybook-lynx-rsbuild', options: {} },
  rsbuildFinal: (config) => ({
    ...config,
    // Workers resolve their split chunks relative to the Storybook origin.
    dev: { ...config.dev, assetPrefix: '/' },
    output: { ...config.output, assetPrefix: '/' },
  }),
});
