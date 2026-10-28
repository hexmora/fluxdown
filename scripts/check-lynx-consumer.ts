/* eslint-disable no-console -- Report packed Lynx consumer verification in release logs. */
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { createRsbuild } from '@rsbuild/core';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { LynxCheckResult, PackageArtifact } from './types.ts';

import { filesUnder, isLynxPackage, publicEntries } from './check-package.ts';

export async function checkLynxConsumer(
  consumer: string,
  artifacts: PackageArtifact[],
): Promise<LynxCheckResult | undefined> {
  const specifiers = artifacts
    .filter(({ manifest }) => isLynxPackage(manifest.name))
    .flatMap(({ manifest, files }) =>
      publicEntries(manifest, files).map(
        ([entry]) => manifest.name + (entry === '.' ? '' : entry.slice(1)),
      ),
    );

  if (!specifiers.length) return;

  // Rspack's virtual modules must use the same canonical path as its resolver.
  consumer = await realpath(consumer);

  const imports = specifiers
    .map((specifier, index) => `import * as Entry${index} from ${JSON.stringify(specifier)};`)
    .join('\n');
  const entries = specifiers.map((_, index) => `Entry${index}`).join(', ');
  const hasRenderer = specifiers.includes('@fluxdown/lynx');
  const hasMath = specifiers.includes('@fluxdown/lynx-plugins/plugins/tex-svg');
  const file = path.join(consumer, 'lynx-consumer.tsx');

  await writeFile(
    file,
    `${imports}
import { root } from '@lynx-js/react';
${hasRenderer ? "import { Fluxdown } from '@fluxdown/lynx';" : ''}
${hasRenderer && hasMath ? "import { TexSvgPlugin } from '@fluxdown/lynx-plugins/plugins/tex-svg';" : ''}

// Retain every public runtime entry, including optional renderers and lazy imports.
if (__BACKGROUND__) Object.assign(globalThis, { fluxdownConsumerEntries: [${entries}] });

root.render(${hasRenderer ? `<Fluxdown text={'Lynx consumer\\n\\n$x^2$'} ${hasMath ? 'build={{ tex: true }} plugins={[TexSvgPlugin]}' : ''} />` : '<view><text>Lynx consumer</text></view>'});
`,
  );

  const typeFile = path.join(consumer, 'lynx-types.tsx');

  await writeFile(
    typeFile,
    hasRenderer
      ? `import { Fluxdown, type FluxdownProps } from '@fluxdown/lynx';
import { FluxdownLite } from '@fluxdown/lynx/lite';
import { FluxdownRaw } from '@fluxdown/lynx/raw';

const props: FluxdownProps = { text: 'consumer', style: { padding: '16px' }, theme: 'dark' };
<Fluxdown {...props} />;
<FluxdownLite {...props} />;
<FluxdownRaw {...props} plugins={[]} />;

// @ts-expect-error Raw requires an explicit plugin selection.
<FluxdownRaw text="consumer" />;
// @ts-expect-error Lynx components apply their own host property conversion.
<Fluxdown text="consumer" getProps={() => ({})} />;
// @ts-expect-error Lynx styles use CSS property values.
<Fluxdown text="consumer" style={{ padding: true }} />;
`
      : 'export {};\n',
  );

  const tsconfig = path.join(consumer, 'tsconfig.lynx.json');

  await writeFile(
    tsconfig,
    JSON.stringify({
      compilerOptions: {
        module: 'ESNext',
        moduleResolution: 'Bundler',
        target: 'ES2022',
        lib: ['ES2022'],
        types: ['@lynx-js/types'],
        strict: true,
        noEmit: true,
        // ReactLynx's upstream declarations conflict with React's global JSX
        // types. Keep consumer code strict, as in the Lynx workspace config.
        skipLibCheck: true,
        jsx: 'preserve',
        jsxImportSource: '@lynx-js/react',
      },
      files: [file, typeFile],
    }),
  );

  const types = spawnSync('pnpm', ['exec', 'tsc', '-p', tsconfig], { encoding: 'utf8' });

  assert.equal(types.status, 0, types.stderr || types.stdout || types.error?.message);

  const output = path.join(consumer, 'lynx-dist');
  const rsbuild = await createRsbuild({
    cwd: consumer,
    config: {
      mode: 'production',
      source: { entry: { consumer: file }, tsconfigPath: tsconfig },
      environments: { lynx: {}, web: {} },
      plugins: [pluginReactLynx()],
      output: { distPath: { root: output }, polyfill: 'off' },
      performance: { printFileSize: false },
      // Published Core already contains headless parser variants. Resolve those
      // variants without the workspace aliases or TypeScript transforms.
      tools: {
        rspack(config) {
          config.resolve ??= {};
          config.resolve.conditionNames = ['worker', ...(config.resolve.conditionNames ?? ['...'])];
        },
      },
    },
  });

  const build = await rsbuild.build();

  try {
    const files = await filesUnder(output);
    const nativeAssets = files.filter((name) => name.endsWith('.lynx.bundle'));
    const webAssets = files.filter((name) => name.endsWith('.web.bundle'));

    assert(nativeAssets.length, 'Lynx consumer did not emit a native bundle');
    assert(webAssets.length, 'Lynx consumer did not emit a Web bundle');

    await Promise.all(
      [...nativeAssets, ...webAssets].map(async (name) => {
        assert((await readFile(path.join(output, name))).length, `Empty Lynx bundle: ${name}`);
      }),
    );

    console.log(
      `Lynx consumer OK: ${specifiers.length} public entries, strict consumer types, and native/Web bundles`,
    );

    return { specifiers, typeEntries: specifiers.length, nativeAssets, webAssets };
  } finally {
    await build.close();
  }
}
