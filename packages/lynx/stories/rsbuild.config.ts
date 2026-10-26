import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';

import { lynxWorkspacePlugin } from '../../../scripts/build/lynx-workspace';

export default defineConfig({
  source: { entry: { playground: './stories/playground.tsx' } },
  environments: { web: {} },
  plugins: [pluginReactLynx(), lynxWorkspacePlugin()],
  output: { distPath: { root: './dist/preview' } },
});
