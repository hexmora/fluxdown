/* eslint-disable no-console -- Report packed Svelte consumer verification in release logs. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { PackageArtifact, SvelteCheckResult } from './types.ts';

import { filesUnder, isSveltePackage, publicEntries, readManifest } from './check-package.ts';

const root = fileURLToPath(new URL('..', import.meta.url));

function run(consumer: string, command: string, args: string[]) {
  const result = spawnSync(command, args, {
    cwd: consumer,
    encoding: 'utf8',
    timeout: 600_000,
    maxBuffer: 16 * 1024 * 1024,
  });

  assert.equal(result.status, 0, result.stderr || result.stdout || result.error?.message);

  return result.stdout;
}

export async function checkSvelteConsumer(
  consumer: string,
  artifacts: PackageArtifact[],
): Promise<SvelteCheckResult | undefined> {
  const specifiers = artifacts
    .filter(({ manifest }) => isSveltePackage(manifest.name))
    .flatMap(({ manifest, files }) =>
      publicEntries(manifest, files).map(
        ([entry]) => manifest.name + (entry === '.' ? '' : entry.slice(1)),
      ),
    );

  if (!specifiers.length) return;

  const tools = await Promise.all(
    ['svelte', '@sveltejs/vite-plugin-svelte', 'vite', 'svelte-check', 'typescript'].map(
      async (name) => {
        const manifest = await readManifest(path.join(root, 'packages/svelte/node_modules', name));

        return manifest.name === name
          ? `${name}@${manifest.version}`
          : `${name}@npm:${manifest.name}@${manifest.version}`;
      },
    ),
  );

  if (!specifiers.includes('@fluxdown/svelte')) {
    const manifest = await readManifest(path.join(root, 'packages/svelte'));

    tools.push(`${manifest.name}@${manifest.version}`);
  }

  run(consumer, 'npm', [
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--no-package-lock',
    ...tools,
  ]);

  const directory = path.join(consumer, 'svelte-consumer');

  const component = path.join(directory, 'consumer-app');

  await mkdir(component, { recursive: true });

  await writeFile(
    path.join(component, 'index.ts'),
    "export { default as ConsumerApp } from './main.svelte';\n",
  );

  await writeFile(
    path.join(component, 'main.svelte'),
    `<script lang="ts">
  import type { FluxdownProps } from '@fluxdown/svelte';

  import { Fluxdown } from '@fluxdown/svelte';
  import { Fluxdown as FluxdownFull } from '@fluxdown/svelte/full';
  import { FluxdownLite } from '@fluxdown/svelte/lite';
  import { FluxdownRaw } from '@fluxdown/svelte/raw';
  import { PRESET_LITE_PLUGINS } from '@fluxdown/svelte-plugins/lite';

  const props: FluxdownProps = {
    text: '# Svelte packed consumer\\n\\nA **packed** package.',
    theme: 'dark',
    class: 'packed-consumer',
    style: 'max-width: 720px',
  };

  const effects = ['scale', 'shad', 'chunk', 'suffix'] as const;
</script>

<section data-pack="root"><Fluxdown {...props} /></section>
<section data-pack="full"><FluxdownFull {...props} /></section>
<section data-pack="lite"><FluxdownLite {...props} /></section>
<section data-pack="raw"><FluxdownRaw {...props} plugins={PRESET_LITE_PLUGINS} /></section>

{#each effects as effect}
  <Fluxdown streaming={{ effect, smooth: effect !== 'chunk' }} text="Effect consumer" />
{/each}
`,
  );

  const imports = specifiers
    .map((specifier, index) => `import * as Entry${index} from ${JSON.stringify(specifier)};`)
    .join('\n');

  const entries = specifiers.map((_, index) => `Entry${index}`).join(', ');

  await writeFile(
    path.join(directory, 'entries.ts'),
    `${imports}

export const entries = [${entries}];
`,
  );

  await writeFile(
    path.join(directory, 'client.ts'),
    `import { mount } from 'svelte';

import { ConsumerApp } from './consumer-app';
import { entries } from './entries';

Object.assign(globalThis, { fluxdownSvelteConsumerEntries: entries });

mount(ConsumerApp, { target: document.getElementById('app')! });
`,
  );

  await writeFile(
    path.join(directory, 'server.ts'),
    `import assert from 'node:assert/strict';
import { render } from 'svelte/server';

import { ConsumerApp } from './consumer-app';
import { entries } from './entries';

export function verify() {
  assert.equal(entries.length, ${specifiers.length});

  const { body } = render(ConsumerApp);

  for (const name of ['root', 'full', 'lite', 'raw']) {
    assert(body.includes('data-pack="' + name + '"'), 'Missing pack: ' + name);
  }

  assert.equal(body.match(/Svelte packed consumer/g)?.length, 4);

  assert.equal(body.match(/<strong\\b/g)?.length, 4);

  return body;
}
`,
  );

  await writeFile(
    path.join(directory, 'types.ts'),
    `import type { ComponentProps } from 'svelte';

import { FluxdownRaw } from '@fluxdown/svelte/raw';

const props: ComponentProps<typeof FluxdownRaw> = { text: 'consumer', plugins: [], getProps: null };

void props;

// @ts-expect-error Raw requires an explicit plugin selection.
const missingPlugins: ComponentProps<typeof FluxdownRaw> = { text: 'consumer' };

void missingPlugins;
`,
  );

  await writeFile(
    path.join(directory, 'index.html'),
    '<!doctype html><html><head><title>Svelte consumer</title></head><body><div id="app"></div><script type="module" src="./client.ts"></script></body></html>\n',
  );

  await writeFile(
    path.join(directory, 'vite.config.mjs'),
    `import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [svelte()],
});
`,
  );

  await writeFile(
    path.join(directory, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        lib: ['ES2022', 'DOM'],
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        esModuleInterop: true,
        verbatimModuleSyntax: true,
        isolatedModules: true,
        types: ['svelte', 'node'],
      },
      include: ['**/*.ts', '**/*.svelte'],
    }),
  );

  run(directory, process.execPath, [
    path.join(consumer, 'node_modules/svelte-check/bin/svelte-check'),
    '--tsconfig',
    './tsconfig.json',
  ]);

  const vite = path.join(consumer, 'node_modules/vite/bin/vite.js');

  run(directory, process.execPath, [vite, 'build']);

  const files = await filesUnder(path.join(directory, 'dist'));

  const cssAssets = files.filter((file) => file.endsWith('.css'));

  const stylesheets = await Promise.all(
    cssAssets.map((file) => readFile(path.join(directory, 'dist', file), 'utf8')),
  );

  const html = await readFile(path.join(directory, 'dist/index.html'), 'utf8');

  assert(
    cssAssets.some(
      (asset, index) =>
        html.includes(asset) && stylesheets[index].includes('.fluxdown-svelte-root'),
    ),
    'Svelte consumer does not load its root stylesheet automatically',
  );

  const css = stylesheets.join('\n');

  assert(css.includes('.fluxdown-svelte-root'), 'Svelte consumer is missing root styles');

  for (const effect of ['scale', 'shad', 'chunk', 'suffix']) {
    assert(css.includes(`.fluxdown-svelte-effect-${effect}`), `Missing Svelte ${effect} styles`);
  }

  run(directory, process.execPath, [
    vite,
    'build',
    '--ssr',
    'server.ts',
    '--outDir',
    'dist-server',
  ]);

  run(directory, process.execPath, [
    '--input-type=module',
    '--eval',
    "const { verify } = await import('./dist-server/server.js'); verify();",
  ]);

  console.log(
    `Svelte consumer OK: ${specifiers.length} public entries, strict declarations, client CSS, and Full/Lite/Raw SSR`,
  );

  return { specifiers, client: true, server: true, declarations: true, styles: true };
}
