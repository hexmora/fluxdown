import { defineConfig } from '@lynx-js/rspeedy';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginVueJsx } from '@rsbuild/plugin-vue-jsx';
import { pluginVueLynx } from 'vue-lynx/plugin';

import { lynxWorkspacePlugin } from '../../../scripts/build/lynx-workspace';
import { vueLynxCompilerPlugin } from '../../../scripts/build/vue-lynx-compiler';

export default defineConfig({
  source: { entry: { playground: './stories/playground.tsx' } },
  environments: { lynx: {}, web: {} },
  plugins: [
    pluginVueLynx({
      autoPixelUnit: false,
      includeWorkletPackages: ['@fluxdown/vue-lynx', '@fluxdown/vue-lynx-plugins'],
    }),
    vueLynxCompilerPlugin(),
    pluginBabel(),
    pluginVueJsx(),
    pluginSass(),
    lynxWorkspacePlugin(),
  ],
  output: { distPath: { root: './dist/preview' }, sourceMap: false },
});
