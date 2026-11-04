import type { RsbuildPlugin, Rspack } from '@rsbuild/core';

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

type Loader = {
  loader: string;

  options?: Record<string, unknown>;
};

const getLoaders = (rule: Rspack.RuleSetRule): Loader[] => {
  const uses = Array.isArray(rule.use) ? rule.use : [rule.use];

  return uses.filter((use): use is Loader => Boolean(use) && typeof use === 'object');
};

const normalizeTargets = (rules: NonNullable<Rspack.RuleSetRule['rules']>): void => {
  for (const rule of rules) {
    if (!rule) continue;

    for (const use of getLoaders(rule)) {
      if (!use.loader.includes('swc-loader')) continue;

      const options = use.options as { env?: unknown; jsc?: { target?: string } } | undefined;

      // Keep Rspeedy's host transforms, including Unicode property escapes for
      // Android QuickJS, instead of Vue Lynx's conflicting es2019 target.
      if (options?.env) {
        if (options.jsc) delete options.jsc.target;
      } else if (options?.jsc) {
        options.jsc.target = 'es2017';
      }
    }

    normalizeTargets(rule.oneOf ?? []);

    normalizeTargets(rule.rules ?? []);
  }
};

const normalizeStyles = (rules: Rspack.RuleSetRule[]): void => {
  for (const background of rules) {
    if (background.issuerLayer !== 'vue:background' || !background.oneOf) continue;

    const extract = getLoaders(background).find((use) =>
      use.loader.includes('@lynx-js/css-extract-webpack-plugin'),
    );

    if (!extract) continue;

    const main = rules.find(
      (rule) =>
        rule.issuerLayer === 'vue:main-thread' && String(rule.test) === String(background.test),
    );

    const ignore = main && getLoaders(main).find((use) => use.loader.includes('ignore-css-loader'));

    // Rsbuild 2 nests stylesheet pipelines in oneOf; Vue Lynx 0.5 expects the
    // loaders directly on the rule. Preserve the native extractor in each branch.
    delete background.use;

    for (const branch of background.oneOf) {
      if (!branch || !branch.use) continue;

      branch.use = getLoaders(branch)
        .filter((use) => !use.loader.includes('lightningcss'))
        .map((use) => (use.loader.includes('css-extract') ? extract : use));
    }

    if (!main || !ignore) continue;

    delete main.use;

    main.oneOf = background.oneOf.map((branch) => {
      if (!branch || !branch.use) return branch;

      const loaders = getLoaders(branch)
        .filter((use) => !use.loader.includes('css-extract'))
        .map((use) => {
          if (!use.loader.includes('css-loader')) return use;

          const modules = use.options?.modules;

          return {
            ...use,
            options: {
              ...use.options,
              modules: {
                ...(typeof modules === 'object' ? modules : {}),
                exportOnlyLocals: true,
              },
            },
          };
        });

      return { ...branch, use: [ignore, ...loaders] };
    });
  }
};

export const vueLynxCompilerPlugin = (): RsbuildPlugin => ({
  name: 'fluxdown:vue-lynx-compiler',
  post: ['lynx:vue'],
  // Vue Lynx 0.5's template hooks do not provide Rspeedy's debug metadata fields.
  remove: ['lynx:debug-metadata'],
  setup(api) {
    api.modifyBundlerChain((chain) => {
      const runtime = require.resolve('vue-lynx');

      chain.resolve.alias.set('vue$', runtime);

      chain.resolve.alias.set('vue-lynx$', runtime);
    });

    api.modifyRspackConfig((config) => {
      const rules = (config.module?.rules ?? []).filter(
        (rule): rule is Rspack.RuleSetRule => Boolean(rule) && typeof rule === 'object',
      );

      normalizeTargets(rules);

      normalizeStyles(rules);
    });
  },
});
