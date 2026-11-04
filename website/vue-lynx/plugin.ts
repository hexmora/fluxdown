import type { RspressPlugin } from '@rspress/core';

import { createRspeedy } from '@lynx-js/rspeedy';
import { createRsbuild } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginVueJsx } from '@rsbuild/plugin-vue-jsx';
import { fileURLToPath } from 'node:url';
import { pluginVueLynx } from 'vue-lynx/plugin';

import { lynxWorkspacePlugin } from '../../scripts/build/lynx-workspace';
import { vueLynxCompilerPlugin } from '../../scripts/build/vue-lynx-compiler';

export function vueLynxDemo(): RspressPlugin {
  return {
    name: 'vue-lynx-demo',
    async beforeBuild(config) {
      const cwd = fileURLToPath(new URL('../', import.meta.url));

      const output = {
        assetPrefix: `${config.base ?? '/'}vue-lynx-demo/`,
        distPath: { root: `${cwd}/docs/public/vue-lynx-demo` },
      };

      const host = await createRsbuild({
        cwd,
        rsbuildConfig: {
          // These are static iframe assets, even when Rspress runs in dev mode.
          mode: 'production',
          source: { entry: { index: `${cwd}/vue-lynx/host.ts` } },
          html: { title: 'Fluxdown · Vue Lynx', meta: { robots: 'noindex' } },
          plugins: [pluginSass()],
          output,
        },
      });

      await host.build();

      const app = await createRspeedy({
        cwd,
        rspeedyConfig: {
          mode: 'production',
          source: {
            entry: { main: `${cwd}/vue-lynx/app.ts` },
            tsconfigPath: `${cwd}/vue-lynx/tsconfig.json`,
          },
          environments: { web: {} },
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
          output: { ...output, assetPrefix: 'auto', cleanDistPath: false, sourceMap: false },
        },
      });

      await app.build();
    },
  };
}
