import type { RsbuildPlugin, Rspack } from '@rslib/core';

import { posix } from 'node:path';

import { stylesheet } from './browser-styles.ts';

/** Preserve the module graph in CJS while keeping Node entry points free of CSS. */
export function reactCjsPlugin(entries: Record<string, string>): RsbuildPlugin {
  return {
    name: 'fluxdown:react-cjs',
    setup(api) {
      api.processAssets({ stage: 'report' }, ({ compilation, sources }) => {
        const dependencies = new Map<string, string[]>();
        const styles = new Set<string>();

        for (const asset of compilation.getAssets()) {
          const source = asset.source.source().toString();

          if (asset.name.endsWith('.css')) {
            if (source.trim()) styles.add(posix.normalize(asset.name));
            else compilation.deleteAsset(asset.name);

            continue;
          }

          if (!asset.name.endsWith('.cjs')) continue;

          const requests = [...source.matchAll(/\b(?:require|import)\((['"])(\.[^'"]+)\1\)/g)].map(
            ([, , request]) => posix.normalize(posix.join(posix.dirname(asset.name), request!)),
          );

          dependencies.set(asset.name, requests);

          // Rslib's bundleless CSS modules export class names and require their
          // stylesheet. Move those side effects into the public browser wrapper.
          const nodeSource = source
            .replace(/^require\((['"])(\.[^'"]+\.css)\1\);?\s*$/gm, '')
            // Native import(CJS) wraps the exports in another default, while
            // browser bundlers already normalize them. React.lazy needs the
            // same module namespace in both environments.
            .replace(
              /\bimport\((['"])(\.[^'"]+\.cjs)\1\)/g,
              '$&.then(module => module.default?.__esModule ? module.default : module)',
            );

          if (nodeSource !== source)
            compilation.updateAsset(asset.name, new sources.RawSource(nodeSource));
        }

        // Bundleless extraction emits CSS assets directly. Its side-effect imports
        // can disappear from optimized JavaScript, but the module graph retains
        // their requests, including inside concatenated CSS Modules.
        for (const chunk of compilation.chunks) {
          const requests = new Set<string>();

          function visitModule(module: Rspack.Module) {
            if ('modules' in module)
              for (const child of (module as Rspack.ConcatenatedModule).modules) visitModule(child);

            for (const { dependency } of compilation.moduleGraph.getOutgoingConnections(module)) {
              const request = dependency.request;

              if (request?.startsWith('.') && request.endsWith('.css')) requests.add(request);
            }
          }

          for (const module of compilation.chunkGraph.getChunkModulesIterable(chunk))
            visitModule(module);

          const extracted = [...chunk.files]
            .map((file) => posix.normalize(file))
            .filter((file) => styles.has(file));

          for (const file of chunk.files) {
            if (!file.endsWith('.cjs')) continue;

            const linked = [...requests]
              .map((request) => posix.normalize(posix.join(posix.dirname(file), request)))
              .filter((request) => styles.has(request));

            dependencies.set(file, [...(dependencies.get(file) ?? []), ...extracted, ...linked]);
          }
        }

        if (styles.size)
          compilation.emitAsset('styles.css', new sources.RawSource(stylesheet('styles', styles)));

        for (const [entry, source] of Object.entries(entries)) {
          const original = source.replace(/^\.\/src\//, '').replace(/\.[cm]?[jt]sx?$/, '.cjs');

          if (!compilation.getAsset(original))
            throw new Error(`The CJS entry ${entry} is missing its compiled module: ${original}`);

          const visited = new Set<string>();
          const files = new Set<string>();

          function visit(file: string) {
            if (visited.has(file)) return;

            visited.add(file);

            if (styles.has(file)) files.add(file);

            for (const dependency of dependencies.get(file) ?? []) visit(dependency);
          }

          visit(original);

          const basename = posix.basename(entry);
          const request = `./${posix.relative(posix.dirname(entry), original)}`;

          if (`${entry}.cjs` !== original)
            compilation.emitAsset(
              `${entry}.cjs`,
              new sources.RawSource(`module.exports = require('${request}');\n`),
            );

          let browserSource = '';

          if (files.size) {
            compilation.emitAsset(`${entry}.css`, new sources.RawSource(stylesheet(entry, files)));
            browserSource = `require('./${basename}.css');\n`;
          }

          browserSource += `module.exports = require('./${basename}.cjs');\n`;

          compilation.emitAsset(`${entry}.browser.cjs`, new sources.RawSource(browserSource));
        }
      });
    },
  };
}
