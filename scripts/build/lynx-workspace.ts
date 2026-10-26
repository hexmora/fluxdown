import type { RsbuildPlugin } from '@rsbuild/core';

// Workspace dependencies expose TypeScript sources. Published dependencies are
// already JavaScript, but local builds must lower TypeScript and stative's JSX
// before the ReactLynx compiler receives them.
export function lynxWorkspacePlugin(): RsbuildPlugin {
  return {
    name: 'fluxdown:lynx-workspace',
    setup(api) {
      api.modifyRspackConfig((config) => {
        config.resolve ??= {};
        // Lynx's background runtime has no DOM. Match the headless parser
        // variants included in the published core packages.
        config.resolve.conditionNames = ['worker', ...(config.resolve.conditionNames ?? ['...'])];
        config.module ??= {};
        config.module.rules ??= [];
        config.module.rules.push(
          {
            test: /\.[cm]?ts$/,
            exclude: /\.d\.[cm]?ts$/,
            enforce: 'pre',
            use: [
              {
                loader: 'builtin:swc-loader',
                options: {
                  jsc: {
                    parser: { syntax: 'typescript' },
                    target: 'es2022',
                    transform: { useDefineForClassFields: true },
                  },
                },
              },
            ],
          },
          {
            test: /[\\/]packages[\\/](?:stative|core|core-plugins)[\\/].*\.tsx$/,
            enforce: 'pre',
            use: [
              {
                loader: 'builtin:swc-loader',
                options: {
                  jsc: {
                    parser: { syntax: 'typescript', tsx: true },
                    target: 'es2022',
                    transform: {
                      react: { runtime: 'automatic', importSource: 'stative', development: false },
                      useDefineForClassFields: true,
                    },
                  },
                },
              },
            ],
          },
        );
      });
    },
  };
}
