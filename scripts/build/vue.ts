import type { Plugin, UserConfig } from 'vite';

import vueJsx from '@vitejs/plugin-vue-jsx';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const filesIn = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);

    return entry.isDirectory() ? filesIn(filename) : [filename];
  });

const declarations = (root: string): Plugin => ({
  name: 'fluxdown-vue-declarations',
  closeBundle() {
    execFileSync('pnpm', ['exec', 'tsc', '-p', 'tsconfig.build.json'], {
      cwd: root,
      stdio: 'inherit',
    });

    const source = path.join(root, 'dist/.types/packages', path.basename(root), 'src');

    for (const file of filesIn(path.join(root, 'src')).filter((item) => item.endsWith('.d.ts'))) {
      const target = path.join(source, path.relative(path.join(root, 'src'), file));

      mkdirSync(path.dirname(target), { recursive: true });

      writeFileSync(target, readFileSync(file));
    }

    for (const format of ['esm', 'cjs']) {
      const extension = format === 'esm' ? '.js' : '.cjs';

      for (const file of filesIn(source).filter((item) => item.endsWith('.d.ts'))) {
        const relative = path.relative(source, file);

        const target = path.join(
          root,
          'dist',
          format,
          relative.replace(/\.d\.ts$/, format === 'esm' ? '.d.ts' : '.d.cts'),
        );

        const contents = readFileSync(file, 'utf8').replace(
          /(['"])(\.{1,2}(?:\/[^'"]*)?)\1/g,
          (match, quote: string, specifier: string) => {
            const resolved = path.resolve(
              path.dirname(file),
              specifier.replace(/(?:\.d)?\.[cm]?[jt]sx?$/, ''),
            );

            const declaration = [`${resolved}.d.ts`, path.join(resolved, 'index.d.ts')].find(
              (candidate) => existsSync(candidate),
            );

            if (!declaration) {
              return match;
            }

            const importPath = path
              .relative(path.dirname(file), declaration)
              .split(path.sep)
              .join('/')
              .replace(/\.d\.ts$/, extension);

            return `${quote}${importPath.startsWith('.') ? importPath : `./${importPath}`}${quote}`;
          },
        );

        mkdirSync(path.dirname(target), { recursive: true });

        writeFileSync(target, contents);
      }
    }

    rmSync(path.join(root, 'dist/.types'), { recursive: true });
  },
});

const browserStyles = (stylesheets: readonly string[]): Plugin => ({
  name: 'fluxdown-vue-browser-styles',
  enforce: 'post',
  generateBundle(options, bundle) {
    const extension = options.format === 'es' ? '.js' : '.cjs';

    const assets = Object.values(bundle)
      .filter((item) => item.type === 'asset')
      .filter((item) => item.fileName.endsWith('.css'));

    const emptyStyles = assets
      .filter((asset) => !Buffer.from(asset.source).toString().trim())
      .map((asset) => asset.fileName);

    for (const file of emptyStyles) {
      delete bundle[file];
    }

    const allStyles = assets.filter((asset) => !emptyStyles.includes(asset.fileName));

    this.emitFile({
      type: 'asset',
      fileName: 'styles.css',
      source: [...stylesheets, ...allStyles.map((item) => `./${item.fileName}`)]
        .map((file) => `@import '${file}';`)
        .join('\n'),
    });

    const collect = (filename: string, visited: string[] = []): string[] => {
      if (visited.includes(filename)) {
        return [];
      }

      visited.push(filename);

      const chunk = bundle[filename];

      if (!chunk || chunk.type !== 'chunk') {
        return [];
      }

      return [
        ...[...(chunk.viteMetadata?.importedCss ?? [])].filter(
          (file) => !emptyStyles.includes(file),
        ),
        ...[...chunk.imports, ...chunk.dynamicImports].flatMap((item) => collect(item, visited)),
      ];
    };

    for (const chunk of Object.values(bundle)) {
      if (chunk.type !== 'chunk' || !chunk.isEntry) {
        continue;
      }

      const styles = collect(chunk.fileName).filter(
        (item, index, list) => list.indexOf(item) === index,
      );

      const relative = (filename: string) =>
        `./${path.posix.relative(path.posix.dirname(chunk.fileName), filename)}`;

      const imports = styles.map((filename) =>
        options.format === 'es'
          ? `import '${relative(filename)}';`
          : `require('${relative(filename)}');`,
      );

      const entry = relative(chunk.fileName);

      const exports =
        options.format === 'es'
          ? `export * from '${entry}';`
          : `module.exports = require('${entry}');`;

      this.emitFile({
        type: 'asset',
        fileName: `${chunk.fileName.slice(0, -extension.length)}.browser${extension}`,
        source: [...imports, exports].join('\n'),
      });
    }
  },
});

export const vuePackageConfig = (
  root: string,
  entries: Record<string, string>,
  stylesheets: readonly string[] = [],
): UserConfig => {
  const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

  const dependencies = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies });

  return {
    plugins: [
      vueJsx({ tsTransform: 'built-in', include: /packages\/vue(?:-plugins)?\/.*\.[jt]sx$/ }),
      browserStyles(stylesheets),
      declarations(root),
    ],
    resolve: { alias: { '@prefix': path.resolve(root, '../vue-plugins/src/styles/_prefix.scss') } },
    oxc: { jsx: { development: false } },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: false,
      cssCodeSplit: true,
      lib: { entry: entries },
      rolldownOptions: {
        external: (id) =>
          dependencies.some((dependency) => id === dependency || id.startsWith(`${dependency}/`)),
        output: [
          {
            format: 'es',
            dir: 'dist/esm',
            entryFileNames: '[name].js',
            chunkFileNames: 'chunks/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash][extname]',
          },
          {
            format: 'cjs',
            dir: 'dist/cjs',
            entryFileNames: '[name].cjs',
            chunkFileNames: 'chunks/[name]-[hash].cjs',
            assetFileNames: 'assets/[name]-[hash][extname]',
          },
        ],
      },
    },
  };
};
