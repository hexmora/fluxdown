/* eslint-disable no-await-in-loop -- Each entry needs its own CSS coverage result. */
/* eslint-disable no-console -- Report verified browser entry points in release logs. */
import { createRsbuild } from '@rsbuild/core';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

import type { BrowserCheckResult, PackageArtifact } from './types.ts';

import { publicEntries, resolveExport } from './check-package.ts';

async function readStylesheet(file: string): Promise<string> {
  const css = await readFile(file, 'utf8');
  const imports = [...css.matchAll(/@import\s+['"]([^'"]+)['"];?/g)];
  const nested = await Promise.all(
    imports.map(([, target]) =>
      readStylesheet(
        target.startsWith('.')
          ? path.resolve(path.dirname(file), target)
          : createRequire(file).resolve(target),
      ),
    ),
  );

  return [css, ...nested].join('\n');
}

async function entryStylesheet(directory: string, entry: string): Promise<string> {
  const file = path.join(directory, entry);
  const source = await readFile(file, 'utf8');
  const imports = [...source.matchAll(/(?:import\s*|require\()['"]([^'"]+\.css)['"]/g)];

  return (
    await Promise.all(
      imports.map(([, target]) =>
        readStylesheet(
          target.startsWith('.')
            ? path.resolve(path.dirname(file), target)
            : createRequire(file).resolve(target),
        ),
      ),
    )
  ).join('\n');
}

function cssClassNames(css: string): string[] {
  const plain = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '');

  const classes = new Set<string>();

  for (const [, selector] of plain.matchAll(/([^{}]+)\{/g)) {
    if (selector.trim().startsWith('@')) continue;

    // Rslib emits ASCII CSS Module class names; check those published selectors.
    for (const [name] of selector.matchAll(/\.[_a-zA-Z][\w-]*/g)) {
      classes.add(name);
    }
  }

  return [...classes].toSorted();
}

function assertCssCoverage(label: string, expected: string, actual: string): number {
  assert(actual.trim().length, `${label}: browser entry did not emit any CSS`);

  const classes = cssClassNames(expected);

  assert(classes.length, `${label}: expected stylesheet has no class selectors`);

  const emitted = new Set(cssClassNames(actual));

  const missing = classes.filter((name) => !emitted.has(name));

  assert(
    !missing.length,
    `${label}: browser bundle is missing CSS selectors: ${missing.join(', ')}`,
  );

  return classes.length;
}

export async function checkBrowserConsumer(
  consumer: string,
  artifacts: PackageArtifact[],
): Promise<BrowserCheckResult[]> {
  const entries: Record<string, string> = {};

  const checks: {
    name: string;
    specifier: string;
    format: 'import' | 'require';
    stylesheet: string;
  }[] = [];

  for (const { manifest, files } of artifacts) {
    const directory = path.join(consumer, 'node_modules', manifest.name);
    const style = resolveExport(manifest.exports?.['./styles.css'], ['browser', 'import']);

    if (
      ['fluxdown', '@fluxdown/react-plugins', '@fluxdown/vue', '@fluxdown/vue-plugins'].includes(
        manifest.name,
      )
    ) {
      assert(style, `${manifest.name}: missing public stylesheet export`);
    }

    if (!style) continue;

    for (const [subpath, target] of publicEntries(manifest, files)) {
      const specifier = manifest.name + (subpath === '.' ? '' : subpath.slice(1));

      let esmHasStyles = false;

      for (const format of ['import', 'require'] as const) {
        const entry = resolveExport(target, ['browser', format]);
        assert(entry, `${specifier}: missing browser entry`);
        const stylesheet = await entryStylesheet(directory, entry);

        if (format === 'import') esmHasStyles = Boolean(stylesheet.trim());
        else
          assert.equal(
            Boolean(stylesheet.trim()),
            esmHasStyles,
            `${specifier}: ESM and CJS browser entries disagree on stylesheet coverage`,
          );

        const name = `browser-${checks.length}-${format}`;

        const filename = path.join(consumer, `${name}.${format === 'import' ? 'mjs' : 'cjs'}`);

        // The fixture imports JavaScript only. CSS must enter through the package itself.
        const source =
          format === 'import'
            ? `import * as api from ${JSON.stringify(specifier)}; globalThis[${JSON.stringify(name)}] = api;`
            : `globalThis[${JSON.stringify(name)}] = require(${JSON.stringify(specifier)});`;

        await writeFile(filename, source);

        entries[name] = filename;

        checks.push({ name, specifier, format, stylesheet });
      }
    }
  }

  if (!checks.length) return [];

  const output = path.join(consumer, 'browser-dist');

  const rsbuild = await createRsbuild({
    cwd: consumer,
    config: {
      mode: 'production',
      source: { entry: entries },
      output: { target: 'web', distPath: { root: output }, polyfill: 'off' },
      performance: { printFileSize: false },
    },
  });

  const build = await rsbuild.build();

  try {
    const stats = build.stats?.toJson({ all: false, entrypoints: true });

    const entrypoints = { ...stats?.entrypoints };

    for (const child of stats?.children ?? []) {
      Object.assign(entrypoints, child.entrypoints);
    }

    const results: BrowserCheckResult[] = [];

    for (const { name, specifier, format, stylesheet } of checks) {
      const cssAssets = (entrypoints[name]?.assets ?? [])
        .map((asset) => asset.name)
        .filter((asset): asset is string => Boolean(asset?.endsWith('.css')));

      if (stylesheet)
        assert(
          cssAssets.length,
          `${specifier} (${format}): browser entry has no initial CSS asset`,
        );

      const css = (
        await Promise.all(cssAssets.map((asset) => readFile(path.join(output, asset), 'utf8')))
      ).join('\n');

      const selectors = stylesheet
        ? assertCssCoverage(`${specifier} (${format})`, stylesheet, css)
        : 0;

      const html = await readFile(path.join(output, `${name}.html`), 'utf8');

      for (const asset of cssAssets)
        assert(html.includes(asset), `${specifier} (${format}): HTML does not load ${asset}`);

      results.push({ specifier, format, cssAssets, selectors, cssBytes: Buffer.byteLength(css) });
    }

    console.log(
      `Browser CSS OK: ${results.length} JavaScript-only ESM/CJS entries load their reachable CSS class selectors`,
    );

    return results;
  } finally {
    await build.close();
  }
}
