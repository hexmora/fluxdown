import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { withDefaultConfig } from '@lynx-js/react/testing-library/rstest-config';
import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

import { lynxWorkspacePlugin } from '../../scripts/build/lynx-workspace';

export default defineConfig({
  extends: [withDefaultConfig(), withRslibConfig()],
  plugins: [pluginReactLynx(), lynxWorkspacePlugin()],
  testEnvironment: 'jsdom',
  setupFiles: ['./rstest.setup.ts'],
  tools: {
    rspack(config) {
      // Resolve browser branches in the simulated Lynx environment.
      config.resolve ??= {};
      config.resolve.aliasFields = ['browser'];
      config.resolve.mainFields = ['browser', 'module', 'main'];
    },
  },
  include: ['src/**/*.test.{ts,tsx}'],
});
