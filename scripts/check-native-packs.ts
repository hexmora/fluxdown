/* eslint-disable no-await-in-loop -- Build each published entry independently to detect dependency leaks. */
/* eslint-disable no-console -- Report native bundle verification in release logs. */
import { createRsbuild } from '@rsbuild/core';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const engines = ['shiki', '@shikijs', 'prismjs', 'katex', '@mathjax', 'react-native-svg'];

/** Verify packed Native entry points with the same web resolution used by consumers. */
export async function checkNativePacks(consumer: string): Promise<void> {
  const entries: { specifier: string; allowed: string[]; effects: string[] }[] = [
    { specifier: '@fluxdown/react-native/raw', allowed: [], effects: [] },
    {
      specifier: '@fluxdown/react-native/lite',
      allowed: [],
      effects: ['shad', 'scale', 'chunk', 'suffix'],
    },
    { specifier: '@fluxdown/react-native-presets/plugins/blockquote', allowed: [], effects: [] },
    {
      specifier: '@fluxdown/react-native-presets/plugins/effect-scale',
      allowed: [],
      effects: ['scale'],
    },
    {
      specifier: '@fluxdown/react-native-presets/plugins/code-shiki',
      allowed: ['shiki', '@shikijs'],
      effects: [],
    },
    {
      specifier: '@fluxdown/react-native-presets/plugins/tex-mathjax',
      allowed: ['@mathjax', 'react-native-svg'],
      effects: [],
    },
  ];

  for (const [index, { specifier, allowed, effects }] of entries.entries()) {
    for (const format of ['import', 'require'] as const) {
      const name = `native-pack-${index}-${format}`;
      const file = path.join(consumer, `${name}.${format === 'import' ? 'mjs' : 'cjs'}`);
      const source =
        format === 'import'
          ? `import * as api from ${JSON.stringify(specifier)}; globalThis.api = api;`
          : `globalThis.api = require(${JSON.stringify(specifier)});`;

      await writeFile(file, source);

      const rsbuild = await createRsbuild({
        cwd: consumer,
        config: {
          mode: 'production',
          source: { entry: { index: file } },
          resolve: {
            alias: {
              'react-native$': path.join(consumer, 'node_modules/react-native-web'),
              'react-native-svg$': path.join(
                consumer,
                'node_modules/react-native-svg/lib/module/ReactNativeSVG.web.js',
              ),
            },
          },
          tools: {
            rspack(config) {
              config.resolve ??= {};
              config.resolve.extensions = [
                '.web.js',
                ...(config.resolve.extensions ?? ['.js', '.json']),
              ];
              // Bob emits explicit .js imports; extension precedence alone cannot select .web.js.
              config.resolve.extensionAlias = {
                ...config.resolve.extensionAlias,
                '.js': ['.web.js', '.js'],
              };
            },
          },
          output: {
            target: 'web',
            distPath: { root: path.join(consumer, name) },
            polyfill: 'off',
          },
          performance: { printFileSize: false },
        },
      });
      const build = await rsbuild.build();

      try {
        const stats = build.stats?.toJson({
          all: false,
          modules: true,
          nestedModules: true,
          orphanModules: true,
          modulesSpace: Infinity,
          nestedModulesSpace: Infinity,
          assets: true,
          ids: true,
        });
        assert(stats, `${specifier}: missing bundle stats`);

        const bundledNames: string[] = [];
        const visit = (modules: NonNullable<typeof stats.modules>, parentBundled = false) => {
          for (const module of modules) {
            const bundled = parentBundled || Boolean(module.chunks?.length);

            if (bundled) bundledNames.push(module.name?.replaceAll('\\', '/') ?? '');
            if (module.modules) visit(module.modules, bundled);
          }
        };

        for (const child of [stats, ...(stats.children ?? [])]) visit(child.modules ?? []);

        const includesPackage = (packageName: string) =>
          bundledNames.some((moduleName) => moduleName.includes(`/node_modules/${packageName}/`));
        // The shared MathJax entry embeds its engine for Metro compatibility.
        const bundledEngines = engines.filter(
          (engine) =>
            includesPackage(engine) ||
            (engine === '@mathjax' &&
              bundledNames.some((moduleName) =>
                /\/node_modules\/@fluxdown\/react-base-presets\/dist\/(?:esm\/math\.js|cjs\/math\.cjs)/.test(
                  moduleName,
                ),
              )),
        );

        assert.deepEqual(
          bundledEngines.filter((engine) => !allowed.includes(engine)),
          [],
          `${specifier} (${format}) includes an unselected engine`,
        );

        for (const engine of allowed)
          assert(bundledEngines.includes(engine), `${specifier} (${format}) is missing ${engine}`);

        assert(
          includesPackage('react-native-web'),
          `${specifier} (${format}) did not resolve React Native Web`,
        );
        assert(
          !includesPackage('react-native'),
          `${specifier} (${format}) bundled the native host implementation`,
        );
        assert(
          !includesPackage('@fluxdown/react-presets'),
          `${specifier} (${format}) pulled in DOM presets`,
        );

        for (const effect of effects)
          assert(
            bundledNames.some((moduleName) =>
              moduleName.includes(`/plugins/effect-${effect}/renderer.web.js`),
            ),
            `${specifier} (${format}) did not select the ${effect} web renderer`,
          );

        const assets = [stats, ...(stats.children ?? [])].flatMap((child) => child.assets ?? []);
        const jsBytes = assets
          .filter((asset) => asset.name?.endsWith('.js'))
          .reduce((total, asset) => total + asset.size, 0);
        console.log(
          `Native pack isolation OK: ${specifier} (${format}), ${jsBytes} JavaScript bytes`,
        );
      } finally {
        await build.close();
      }
    }
  }
}
