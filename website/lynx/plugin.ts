import type { RspressPlugin } from '@rspress/core';

import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { createRsbuild } from '@rsbuild/core';
import { pluginSass } from '@rsbuild/plugin-sass';
import { fileURLToPath } from 'node:url';

import { lynxWorkspacePlugin } from '../../scripts/build/lynx-workspace';

export function lynxDemo(): RspressPlugin {
  return {
    name: 'lynx-demo',
    async beforeBuild(config) {
      const cwd = fileURLToPath(new URL('../', import.meta.url));

      const output = {
        assetPrefix: `${config.base ?? '/'}lynx-demo/`,
        distPath: { root: `${cwd}/docs/public/lynx-demo` },
      };

      const host = await createRsbuild({
        cwd,
        rsbuildConfig: {
          // These are static iframe assets, even when Rspress runs in dev mode.
          mode: 'production',
          source: { entry: { index: `${cwd}/lynx/host.ts` } },
          html: { title: 'Fluxdown · Lynx' },
          plugins: [pluginSass()],
          output,
        },
      });

      await host.build();

      const app = await createRsbuild({
        cwd,
        rsbuildConfig: {
          mode: 'production',
          source: { entry: { main: `${cwd}/lynx/app.tsx` } },
          environments: { web: {} },
          plugins: [pluginReactLynx(), pluginSass(), lynxWorkspacePlugin()],
          output: { ...output, cleanDistPath: false },
        },
      });

      await app.build();
    },
  };
}
