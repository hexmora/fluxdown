/* eslint-disable no-await-in-loop -- Build each entry independently to detect dependency leaks. */
/* eslint-disable no-console -- Report isolated bundle verification in release logs. */
import { createRsbuild } from '@rsbuild/core';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const engines = ['shiki', '@shikijs', 'prismjs', 'katex', '@mathjax', 'pele'];

export async function checkReactPacks(consumer: string): Promise<void> {
  const entries = [
    { specifier: 'fluxdown/raw', allowed: [] },
    { specifier: 'fluxdown/lite', allowed: [] },
    {
      specifier: 'fluxdown/full',
      allowed: ['shiki', '@shikijs', 'katex', '@mathjax', 'pele'],
    },
    { specifier: '@fluxdown/react-presets/plugins/blockquote', allowed: [] },
    {
      specifier: '@fluxdown/react-presets/plugins/code-pele',
      allowed: ['pele'],
    },
    { specifier: '@fluxdown/react-presets/plugins/code-prism', allowed: ['prismjs'] },
    { specifier: '@fluxdown/react-presets/plugins/tex-katex', allowed: ['katex'] },
  ];

  for (const [index, { specifier, allowed }] of entries.entries()) {
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
        const forbidden = new Set(engines.filter((engine) => !allowed.includes(engine)));
        const bundledEngines = new Set<string>();
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
              for (const engine of engines)
                if (moduleName.includes(`/node_modules/${engine}/`)) {
                  bundledEngines.add(engine);

                  if (initial) initialEngines.add(engine);
                }

            if (module.modules) visit(module.modules, bundled, initial);
          }
        };

        for (const child of compilations) visit(child.modules ?? []);

        assert.deepEqual(
          [...bundledEngines].filter((engine) => forbidden.has(engine)),
          [],
          `${specifier} (${format}) includes an unselected engine`,
        );

        assert.deepEqual(
          [...initialEngines],
          [],
          `${specifier} (${format}) eagerly loads an engine`,
        );

        for (const engine of allowed)
          assert(bundledEngines.has(engine), `${specifier} (${format}) is missing ${engine}`);

        const assets = compilations.flatMap((child) => child.assets ?? []);
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
