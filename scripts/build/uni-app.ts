import type { Plugin, UserConfig } from 'vite';

import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';

const filesIn = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);

    if (entry.name === '__tests__') {
      return [];
    }

    return entry.isDirectory() ? filesIn(filename) : [filename];
  });

const templates = (root: string, sources: string[]): Plugin => ({
  name: 'fluxdown-uni-app-templates',

  closeBundle() {
    // App Vapor must compile templates in the consuming project's target pipeline.
    for (const file of sources.filter((item) => item.endsWith('.uvue'))) {
      const target = path.join(root, 'dist', path.relative(path.join(root, 'src'), file));

      mkdirSync(path.dirname(target), { recursive: true });

      cpSync(file, target);
    }

    execFileSync('pnpm', ['exec', 'vue-tsc', '-p', 'tsconfig.build.json'], {
      cwd: root,
      stdio: 'inherit',
    });

    const declarations = path.join(root, 'dist/.types/packages', path.basename(root), 'src');

    cpSync(declarations, path.join(root, 'dist'), { recursive: true });

    for (const file of sources.filter((item) => item.endsWith('.d.ts'))) {
      const target = path.join(root, 'dist', path.relative(path.join(root, 'src'), file));

      mkdirSync(path.dirname(target), { recursive: true });

      cpSync(file, target);
    }

    rmSync(path.join(root, 'dist/.types'), { recursive: true });
  },
});

export const uniPackageConfig = (root: string): UserConfig => {
  const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

  const dependencies = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies });

  const sources = filesIn(path.join(root, 'src'));

  const entry = Object.fromEntries(
    sources
      .filter((file) => file.endsWith('.ts') && !file.endsWith('.d.ts'))
      .map((file) => [path.relative(path.join(root, 'src'), file).slice(0, -3), file]),
  );

  return {
    plugins: [templates(root, sources)],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: false,
      lib: { entry, formats: ['es'] },
      rolldownOptions: {
        external: (id) =>
          id.endsWith('.uvue') ||
          dependencies.some((dependency) => id === dependency || id.startsWith(`${dependency}/`)),
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
        },
      },
    },
  };
};
