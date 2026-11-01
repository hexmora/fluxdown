import { glob, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

await Promise.all(
  ['angular', 'angular-plugins'].map(async (name) => {
    const root = fileURLToPath(new URL(`../packages/${name}/`, import.meta.url));

    const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')) as {
      exports: Record<string, string>;
      dependencies: Record<string, string>;
    };

    const previous: string[] = [];

    for await (const file of glob('**/ng-package.json', {
      cwd: root,
      exclude: ['node_modules/**', 'dist/**'],
    })) {
      previous.push(file);
    }

    await Promise.all(previous.map((file) => rm(path.join(root, file))));

    const entries = { '.': './src/index.ts', ...manifest.exports };

    await Promise.all(
      Object.entries(entries).map(async ([entry, source]) => {
        const directory = path.resolve(root, entry);

        const config = {
          ...(entry === '.' && {
            $schema: './node_modules/ng-packagr/ng-package.schema.json',
            dest: 'dist',
            allowedNonPeerDependencies: Object.keys(manifest.dependencies),
          }),
          lib: { entryFile: path.relative(directory, path.resolve(root, source)) },
        };

        await mkdir(directory, { recursive: true });

        await writeFile(
          path.join(directory, 'ng-package.json'),
          `${JSON.stringify(config, null, 2)}\n`,
        );
      }),
    );
  }),
);
