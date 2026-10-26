import type { RsbuildPlugin, Rspack } from '@rslib/core';

import { createHash } from 'node:crypto';
import { posix } from 'node:path';

/** Split styles by module so a lite entry never inherits another entry's CSS. */
export function styleChunkName(module: Rspack.Module): string {
  const id = module.identifier().replaceAll(process.cwd(), '');

  return `styles/${createHash('sha256').update(id).digest('hex').slice(0, 12)}`;
}

export function stylesheet(entry: string, files: Iterable<string>): string {
  return [...files]
    .map((file) => `@import './${posix.relative(posix.dirname(entry), file)}';`)
    .join('\n');
}

export function browserStylesPlugin(entries: string[], format: 'esm' | 'cjs'): RsbuildPlugin {
  const name = `fluxdown:browser-styles-${format}`;

  return {
    name,
    setup(api) {
      const dependencies = new Map<string, Set<string>>();

      api.modifyRspackConfig((config) => {
        config.plugins ??= [];
        config.plugins.push({
          apply(compiler: Rspack.Compiler) {
            compiler.hooks.compilation.tap(name, (compilation) => {
              // Record the graph before concatenation, including lazy renderer styles.
              compilation.hooks.finishModules.tap(name, () => {
                dependencies.clear();

                for (const [entry, data] of compilation.entries) {
                  const visited = new Set<string>();

                  function visit(module: Rspack.Module | null) {
                    if (!module || visited.has(module.identifier())) return;

                    visited.add(module.identifier());

                    for (const connection of compilation.moduleGraph.getOutgoingConnections(module))
                      visit(connection.module);
                  }

                  for (const dependency of data.dependencies)
                    visit(compilation.moduleGraph.getModule(dependency));

                  dependencies.set(entry, visited);
                }
              });
            });
          },
        });
      });

      api.processAssets({ stage: 'report' }, ({ compilation, sources }) => {
        const styles = new Map<string, Set<string>>();

        for (const asset of compilation.getAssets()) {
          if (asset.name.endsWith('.css') && !asset.source.source().toString().trim())
            compilation.deleteAsset(asset.name);
        }

        for (const module of compilation.modules) {
          if (module.type !== 'css/mini-extract') continue;

          const files = new Set<string>();

          for (const chunk of compilation.chunkGraph.getModuleChunksIterable(module))
            for (const file of chunk.files)
              if (file.endsWith('.css') && compilation.getAsset(file)) files.add(file);

          styles.set(module.identifier(), files);
        }

        const allStyles = new Set([...styles.values()].flatMap((files) => [...files]));

        if (allStyles.size)
          compilation.emitAsset(
            'styles.css',
            new sources.RawSource(stylesheet('styles', allStyles)),
          );

        const extension = format === 'esm' ? 'js' : 'cjs';

        for (const entry of entries) {
          const files = new Set(
            [...(dependencies.get(entry) ?? [])].flatMap((id) => [...(styles.get(id) ?? [])]),
          );
          const basename = posix.basename(entry);
          const original = `./${basename}.${extension}`;
          let source = '';

          if (files.size) {
            compilation.emitAsset(`${entry}.css`, new sources.RawSource(stylesheet(entry, files)));
            source =
              format === 'esm'
                ? `import './${basename}.css';\n`
                : `require('./${basename}.css');\n`;
          }

          source +=
            format === 'esm'
              ? `export * from '${original}';\n`
              : `module.exports = require('${original}');\n`;

          compilation.emitAsset(`${entry}.browser.${extension}`, new sources.RawSource(source));
        }
      });
    },
  };
}
