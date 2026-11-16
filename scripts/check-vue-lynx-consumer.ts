/* eslint-disable no-console -- Report packed Vue Lynx consumer verification in release logs. */
import { createRspeedy } from '@lynx-js/rspeedy';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pluginVueLynx } from 'vue-lynx/plugin';

import type { LynxCheckResult, PackageArtifact } from './types.ts';

import { vueLynxCompilerPlugin } from './build/vue-lynx-compiler.ts';
import { filesUnder, isVueLynxPackage, publicEntries } from './check-package.ts';

async function verifyVueLynxConsumer(
  consumer: string,
  artifacts: PackageArtifact[],
): Promise<LynxCheckResult | undefined> {
  const specifiers = artifacts
    .filter(({ manifest }) => isVueLynxPackage(manifest.name))
    .flatMap(({ manifest, files }) =>
      publicEntries(manifest, files).map(
        ([entry]) => manifest.name + (entry === '.' ? '' : entry.slice(1)),
      ),
    );

  if (!specifiers.length) return;

  consumer = await realpath(consumer);

  const imports = specifiers
    .map((specifier, index) => `import * as Entry${index} from ${JSON.stringify(specifier)};`)
    .join('\n');

  const entries = specifiers.map((_, index) => `Entry${index}`).join(', ');

  const hasRenderer = specifiers.includes('@fluxdown/vue-lynx');

  const hasMath = specifiers.includes('@fluxdown/vue-lynx-plugins/plugins/tex-mathjax');

  const markdown = 'Vue Lynx consumer\n\n$x^2$\n\n```javascript\nconst value = 42;\n```';

  const file = path.join(consumer, 'vue-lynx-consumer.ts');

  await writeFile(
    file,
    `${imports}
import { createApp, h } from 'vue-lynx';
${hasRenderer ? "import { Fluxdown } from '@fluxdown/vue-lynx';" : ''}

Object.assign(globalThis, { fluxdownConsumerEntries: [${entries}] });

createApp({ render: () => ${hasRenderer ? `h(Fluxdown, { text: ${JSON.stringify(markdown)}, ${hasMath ? 'build: { tex: true }' : ''} })` : "h('view', [h('text', 'Vue Lynx consumer')])"} }).mount();
`,
  );

  const typeFile = path.join(consumer, 'vue-lynx-types.ts');

  await writeFile(
    typeFile,
    hasRenderer
      ? `import { Fluxdown, type FluxdownProps } from '@fluxdown/vue-lynx';
import { FluxdownLite } from '@fluxdown/vue-lynx/lite';
import { FluxdownRaw } from '@fluxdown/vue-lynx/raw';
import { h } from 'vue';

const props: FluxdownProps = { text: 'consumer', style: { padding: '16px' }, theme: 'dark' };

h(Fluxdown, props);

h(FluxdownLite, props);

h(FluxdownRaw, { ...props, plugins: [] });

// @ts-expect-error Native host properties do not accept boolean padding.
const invalid: FluxdownProps = { text: 'consumer', style: { padding: true } };

void invalid;
`
      : 'export {};\n',
  );

  const tsconfig = path.join(consumer, 'tsconfig.vue-lynx.json');

  await writeFile(
    tsconfig,
    JSON.stringify({
      compilerOptions: {
        module: 'ESNext',
        moduleResolution: 'Bundler',
        target: 'ES2022',
        lib: ['ES2022', 'DOM'],
        types: ['@lynx-js/types'],
        strict: true,
        noEmit: true,
        skipLibCheck: true,
      },
      files: [file, typeFile],
    }),
  );

  const types = spawnSync('pnpm', ['exec', 'tsc', '-p', tsconfig], { encoding: 'utf8' });

  assert.equal(types.status, 0, types.stderr || types.stdout || types.error?.message);

  const output = path.join(consumer, 'vue-lynx-dist');

  const rspeedy = await createRspeedy({
    cwd: consumer,
    rspeedyConfig: {
      mode: 'production',
      source: { entry: { consumer: file }, tsconfigPath: tsconfig },
      environments: { lynx: {}, web: {} },
      plugins: [
        ...pluginVueLynx({
          autoPixelUnit: false,
          includeWorkletPackages: ['@fluxdown/vue-lynx', '@fluxdown/vue-lynx-plugins'],
        }),
        vueLynxCompilerPlugin(),
      ],
      output: { distPath: { root: output } },
      performance: { printFileSize: false },
      tools: {
        rspack(config) {
          config.resolve ??= {};

          config.resolve.conditionNames = ['worker', ...(config.resolve.conditionNames ?? ['...'])];
        },
      },
    },
  });

  const build = await rspeedy.build();

  try {
    const files = await filesUnder(output);

    const nativeAssets = files.filter((name) => name.endsWith('.lynx.bundle'));

    const webAssets = files.filter((name) => name.endsWith('.web.bundle'));

    assert(nativeAssets.length, 'Vue Lynx consumer did not emit a native bundle');

    assert(webAssets.length, 'Vue Lynx consumer did not emit a Web bundle');

    await Promise.all(
      [...nativeAssets, ...webAssets].map(async (name) => {
        assert((await readFile(path.join(output, name))).length, `Empty Vue Lynx bundle: ${name}`);
      }),
    );

    await Promise.all(
      webAssets.map(async (name) => {
        const bundle = JSON.parse(await readFile(path.join(output, name), 'utf8')) as {
          lepusCode?: { root?: string };

          pageConfig?: { enableCSSInheritance?: boolean };

          styleInfo?: unknown;
        };

        assert.equal(
          bundle.pageConfig?.enableCSSInheritance ?? false,
          false,
          'Vue Lynx CSS inheritance differs from the React Lynx default',
        );

        const styles = JSON.stringify(bundle.styleInfo);

        // Chunk and shad only add reduced-motion rules, which the Lynx encoder omits.
        for (const selector of ['fluxdown-scale', 'fluxdown-suffix', 'fluxdown-table']) {
          assert(styles.includes(selector), `Missing Vue Lynx stylesheet: ${selector}`);
        }

        const registrations = bundle.lepusCode?.root?.match(/\bregisterWorkletInternal\(/g) ?? [];

        assert(
          registrations.length >= 4,
          'Vue Lynx color/scale animation worklets were pruned from the main thread',
        );
      }),
    );

    console.log(
      `Vue Lynx consumer OK: ${specifiers.length} public entries, strict consumer types, native/Web bundles, styles, and main-thread animation worklets`,
    );

    return { specifiers, typeEntries: specifiers.length, nativeAssets, webAssets };
  } finally {
    await build.close();
  }
}

export async function checkVueLynxConsumer(
  consumer: string,
  artifacts: PackageArtifact[],
): Promise<LynxCheckResult | undefined> {
  if (!artifacts.some(({ manifest }) => isVueLynxPackage(manifest.name))) return;

  const input = path.join(consumer, 'vue-lynx-artifacts.json');

  const output = path.join(consumer, 'vue-lynx-result.json');

  await writeFile(input, JSON.stringify(artifacts));

  // React Lynx and Vue Lynx load different native Lepus compilers; isolate their initializers.
  const result = spawnSync(
    'pnpm',
    ['exec', 'tsx', fileURLToPath(import.meta.url), consumer, input, output],
    { encoding: 'utf8', timeout: 600_000, maxBuffer: 16 * 1024 * 1024 },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout || result.error?.message);

  process.stdout.write(result.stdout);

  return JSON.parse(await readFile(output, 'utf8')) as LynxCheckResult;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [consumer, input, output] = process.argv.slice(2);

  const artifacts = JSON.parse(await readFile(input, 'utf8')) as PackageArtifact[];

  const result = await verifyVueLynxConsumer(consumer, artifacts);

  await writeFile(output, JSON.stringify(result));
}
