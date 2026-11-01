import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const pluginsRoot = resolve(import.meta.dirname, '../angular-plugins');

const { dependencies } = JSON.parse(readFileSync(resolve(pluginsRoot, 'package.json'), 'utf8')) as {
  dependencies: Record<string, string>;
};

const packages = Object.entries(dependencies)
  .filter(([, version]) => !version.startsWith('workspace:'))
  .map(([name]) => name);

export default defineConfig({
  plugins: [
    {
      name: 'fluxdown-workspace',
      enforce: 'pre',
      config() {
        // Angular forwards plugins to its Vitest project, but not top-level Oxc options.
        return { oxc: { jsx: { development: false } } };
      },
      resolveId(source) {
        if (!packages.some((name) => source === name || source.startsWith(`${name}/`))) {
          return;
        }

        // CLI test chunks live outside the plugins' dependency tree; retain package exports.
        return this.resolve(source, resolve(pluginsRoot, 'src/index.ts'), { skipSelf: true });
      },
    },
  ],
});
