/* eslint-disable no-await-in-loop -- Build each entry independently to detect dependency leaks. */
/* eslint-disable no-console -- Report isolated bundle verification in release logs. */
import { createRsbuild } from '@rsbuild/core';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { reactNativeWebPlugin } from './build/react-native-web.ts';

const nativeEngines = [
  'mathjax-full',
  'react-native-code-highlighter',
  'react-syntax-highlighter',
  '@osuki-dev/skia-diagrams',
];

const engines = ['shiki', '@shikijs', 'prismjs', 'katex', '@mathjax', 'pele', ...nativeEngines];

const syntaxExtensions = [
  'remark-gemoji',
  'micromark-extension-cjk-friendly',
  'micromark-extension-cjk-friendly-gfm-strikethrough',
];

const dependencies = [...engines, ...syntaxExtensions, 'react-native-svg'];

const domDependencies = ['react-dom', 'fluxdown', '@fluxdown/react-plugins'];
const trackedDependencies = [
  ...dependencies,
  ...domDependencies,
  '@fluxdown/react-base',
  '@fluxdown/react-base-plugins',
];

export async function checkReactPacks(consumer: string, native = false): Promise<void> {
  const entries: { specifier: string; allowed: string[]; headless?: boolean }[] = [
    { specifier: '@fluxdown/react-hooks', allowed: [], headless: true },
    { specifier: '@fluxdown/react-base', allowed: [], headless: true },
    { specifier: '@fluxdown/react-base-plugins/base', allowed: [], headless: true },
    { specifier: '@fluxdown/react-base-plugins/plugins/blockquote', allowed: [], headless: true },
    { specifier: '@fluxdown/react-base-plugins/plugins/effect-scale', allowed: [], headless: true },
    { specifier: '@fluxdown/react-base-plugins/plugins/fallback', allowed: [], headless: true },
    { specifier: 'fluxdown/raw', allowed: [] },
    { specifier: 'fluxdown/lite', allowed: [] },
    {
      specifier: 'fluxdown/full',
      allowed: ['shiki', '@shikijs', 'katex', '@mathjax', 'pele', ...syntaxExtensions],
    },
    { specifier: '@fluxdown/react-plugins/plugins/blockquote', allowed: [] },
    { specifier: '@fluxdown/react-base-plugins/plugins/emoji', allowed: ['remark-gemoji'] },
    {
      specifier: '@fluxdown/react-base-plugins/plugins/cjk',
      allowed: [
        'micromark-extension-cjk-friendly',
        'micromark-extension-cjk-friendly-gfm-strikethrough',
      ],
    },
    {
      specifier: '@fluxdown/react-plugins/plugins/code-pele',
      allowed: ['pele'],
    },
    { specifier: '@fluxdown/react-plugins/plugins/code-prism', allowed: ['prismjs'] },
    { specifier: '@fluxdown/react-plugins/plugins/tex-katex', allowed: ['katex'] },
  ];

  if (native)
    entries.push(
      { specifier: '@fluxdown/react-native/raw', allowed: [] },
      { specifier: '@fluxdown/react-native/lite', allowed: ['react-native-svg'] },
      {
        specifier: '@fluxdown/react-native/full',
        allowed: [...nativeEngines, ...syntaxExtensions, 'react-native-svg'],
      },
      { specifier: '@fluxdown/react-native-plugins/plugins/paragraph', allowed: [] },
      {
        specifier: '@fluxdown/react-native-plugins/plugins/tex-svg',
        allowed: ['mathjax-full', 'react-native-svg'],
      },
      { specifier: '@fluxdown/react-native-plugins/plugins/effect-chunk', allowed: [] },
      {
        specifier: '@fluxdown/react-native-plugins/plugins/effect-scale',
        allowed: ['react-native-svg'],
      },
      { specifier: '@fluxdown/react-native-plugins/plugins/effect-shad', allowed: [] },
      {
        specifier: '@fluxdown/react-native-plugins/plugins/effect-suffix',
        allowed: [],
      },
    );

  for (const [index, { specifier, allowed, headless }] of entries.entries()) {
    const nativeEntry = specifier.startsWith('@fluxdown/react-native');

    for (const format of ['import', 'require'] as const) {
      const name = `pack-${index}-${format}`;
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
          plugins: nativeEntry ? [reactNativeWebPlugin(consumer)] : [],
          source: { entry: { index: file } },
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
          chunks: true,
          ids: true,
        });
        assert(stats, `${specifier}: missing bundle stats`);
        const forbidden = new Set(
          dependencies.filter((dependency) => !allowed.includes(dependency)),
        );

        if (nativeEntry) {
          forbidden.add('fluxdown');

          forbidden.add('@fluxdown/react-plugins');
        }

        if (headless) {
          for (const dependency of domDependencies) forbidden.add(dependency);

          if (specifier !== '@fluxdown/react-base') forbidden.add('@fluxdown/react-base');

          if (specifier === '@fluxdown/react-hooks') forbidden.add('@fluxdown/react-base-plugins');
        }

        const bundledDependencies = new Set<string>();
        const initialEngines = new Set<string>();
        const compilations = [stats, ...(stats.children ?? [])];
        const initialChunks = new Set(
          compilations.flatMap((child) =>
            (child.chunks ?? []).flatMap((chunk) =>
              chunk.initial && chunk.id !== undefined ? [chunk.id] : [],
            ),
          ),
        );

        const visit = (
          modules: NonNullable<typeof stats.modules>,
          parentBundled = false,
          parentInitial = false,
        ) => {
          for (const module of modules) {
            const bundled = parentBundled || Boolean(module.chunks?.length);
            const initial =
              parentInitial || Boolean(module.chunks?.some((id) => initialChunks.has(id)));
            const moduleName = module.name?.replaceAll('\\', '/') ?? '';

            if (bundled)
              for (const dependency of trackedDependencies)
                if (moduleName.includes(`/node_modules/${dependency}/`)) {
                  bundledDependencies.add(dependency);

                  if (initial && engines.includes(dependency)) initialEngines.add(dependency);
                }

            if (module.modules) visit(module.modules, bundled, initial);
          }
        };

        for (const child of compilations) visit(child.modules ?? []);

        assert.deepEqual(
          [...bundledDependencies].filter((dependency) => forbidden.has(dependency)),
          [],
          `${specifier} (${format}) includes an unselected dependency`,
        );

        assert.deepEqual(
          [...initialEngines],
          [],
          `${specifier} (${format}) eagerly loads an engine`,
        );

        for (const dependency of allowed)
          assert(
            bundledDependencies.has(dependency),
            `${specifier} (${format}) is missing ${dependency}`,
          );

        const assets = compilations.flatMap((child) => child.assets ?? []);

        if (headless)
          assert(
            !assets.some((asset) => asset.name?.endsWith('.css')),
            `${specifier} (${format}) includes DOM styles`,
          );

        const jsBytes = assets
          .filter((asset) => asset.name?.endsWith('.js'))
          .reduce((total, asset) => total + asset.size, 0);
        console.log(`Pack isolation OK: ${specifier} (${format}), ${jsBytes} JavaScript bytes`);
      } finally {
        await build.close();
      }
    }
  }
}
