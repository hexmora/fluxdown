/* eslint-disable no-console -- Report packed uni-app consumer verification in release logs. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { stripVTControlCharacters } from 'node:util';

import type { PackageArtifact, UniAppCheckResult } from './types.ts';

import { filesUnder, isUniAppPackage, publicEntries } from './check-package.ts';

const COMPILER_VERSION = '3.0.0-5030320261023001';

export async function checkUniAppConsumer(
  consumer: string,
  artifacts: PackageArtifact[],
): Promise<UniAppCheckResult | undefined> {
  const packages = artifacts.filter(({ manifest }) => isUniAppPackage(manifest.name));

  if (!packages.length) {
    return;
  }

  const specifiers = packages.flatMap(({ manifest, files }) =>
    publicEntries(manifest, files).map(
      ([entry]) => manifest.name + (entry === '.' ? '' : entry.slice(1)),
    ),
  );

  // The official compiler pins Vue independently of the React/Vue consumer checks.
  const directory = path.join(consumer, 'uni-app');

  await mkdir(path.join(directory, 'src/pages/index'), { recursive: true });

  const selected = [...packages];

  for (const artifact of selected) {
    const dependencies = {
      ...artifact.manifest.dependencies,
      ...artifact.manifest.optionalDependencies,
      ...artifact.manifest.peerDependencies,
    };

    for (const candidate of artifacts) {
      if (candidate.manifest.name in dependencies && !selected.includes(candidate)) {
        selected.push(candidate);
      }
    }
  }

  const dependencies = Object.fromEntries(
    selected.map(({ manifest, tarball }) => [manifest.name, `file:${tarball}`]),
  );

  await writeFile(
    path.join(directory, 'package.json'),
    JSON.stringify({
      name: 'fluxdown-uni-app-consumer-check',
      private: true,
      type: 'module',
      dependencies: {
        ...dependencies,
        '@dcloudio/uni-app': COMPILER_VERSION,
        '@dcloudio/uni-components': COMPILER_VERSION,
        '@dcloudio/uni-h5': COMPILER_VERSION,
        vue: '3.4.21',
      },
      devDependencies: {
        '@dcloudio/uni-cli-shared': COMPILER_VERSION,
        '@dcloudio/uni-uts-v1': COMPILER_VERSION,
        '@dcloudio/vite-plugin-uni': COMPILER_VERSION,
        sass: '1.100.0',
        typescript: 'npm:@typescript/typescript6@6.0.2',
        vite: '5.2.8',
        'vue-tsc': '3.3.13',
      },
      overrides: Object.fromEntries(
        selected.map(({ manifest }) => [manifest.name, `$${manifest.name}`]),
      ),
    }),
  );

  const run = (command: string, args: string[], env?: NodeJS.ProcessEnv) => {
    const result = spawnSync(command, args, {
      cwd: directory,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
      env: { ...process.env, ...env },
    });

    const output = [result.stdout, result.stderr, result.error?.message].filter(Boolean).join('\n');

    assert.equal(result.status, 0, output);

    return output;
  };

  run('npm', [
    'install',
    '--include=dev',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--no-package-lock',
  ]);

  await Promise.all(
    selected.map(async ({ manifest }) => {
      const installed = JSON.parse(
        await readFile(path.join(directory, 'node_modules', manifest.name, 'package.json'), 'utf8'),
      );

      assert.equal(
        installed.version,
        manifest.version,
        `Unexpected uni-app consumer ${manifest.name}`,
      );
    }),
  );

  const imports = specifiers
    .map((specifier, index) => `import * as Entry${index} from ${JSON.stringify(specifier)};`)
    .join('\n');

  const entries = specifiers.map((_, index) => `Entry${index}`).join(', ');

  const hasRenderer = specifiers.includes('@fluxdown/uni-app');

  await Promise.all([
    writeFile(
      path.join(directory, 'vite.config.js'),
      "import uni from '@dcloudio/vite-plugin-uni';\n\nexport default { plugins: [uni.default()] };\n",
    ),
    writeFile(
      path.join(directory, 'index.html'),
      '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>\n',
    ),
    writeFile(
      path.join(directory, 'src/App.uvue'),
      '<script setup lang="ts">\nimport { onLaunch } from \'@dcloudio/uni-app\';\n\nonLaunch(() => {});\n</script>\n',
    ),
    writeFile(
      path.join(directory, 'src/main.ts'),
      `import { createSSRApp } from 'vue';
import App from './App.uvue';

export function createApp() {
  return { app: createSSRApp(App) };
}
`,
    ),
    writeFile(
      path.join(directory, 'src/pages.json'),
      JSON.stringify({ pages: [{ path: 'pages/index/index' }] }),
    ),
    writeFile(
      path.join(directory, 'src/manifest.json'),
      JSON.stringify({
        name: 'Fluxdown consumer',
        appid: '__UNI__FLUXDOWN',
        versionName: '1.0.0',
        versionCode: '100',
        vueVersion: '3',
        uniStatistics: { enable: false },
        'uni-app-x': { vapor: true, styleIsolationVersion: '2', 'vapor-default-script-lang': 'ts' },
      }),
    ),
    writeFile(
      path.join(directory, 'src/pages/index/index.uvue'),
      `<script setup lang="ts">
${imports}
${
  hasRenderer
    ? `import { Fluxdown } from '@fluxdown/uni-app';
import { FluxdownLite } from '@fluxdown/uni-app/lite';
import { FluxdownRaw } from '@fluxdown/uni-app/raw';`
    : ''
}

Object.assign(globalThis, { fluxdownConsumerEntries: [${entries}] });
</script>

<template>
  <view>
    ${
      hasRenderer
        ? `<Fluxdown text="# Packed consumer" :build="{ tex: true }" />
    <FluxdownLite text="**Lite** consumer" />
    <FluxdownRaw text="Raw consumer" :plugins="[]" />`
        : '<text>Packed plugins</text>'
    }
  </view>
</template>
`,
    ),
    writeFile(
      path.join(directory, 'consumer-types.ts'),
      `${imports}

export const entries = [${entries}];
${
  hasRenderer
    ? `import type { FluxdownProps, FluxdownRawProps, FluxdownRef } from '@fluxdown/uni-app';
import type { IPluginItem, Theme } from '@fluxdown/uni-app-plugins/typings';
import { FluxdownRaw } from '@fluxdown/uni-app/raw';

const plugins: IPluginItem[] = [];

const theme: Theme = ['dark', { tokens: { colors: { accent: '#123456' } } }];

export const props: FluxdownProps = { text: 'consumer', streaming: { smooth: false, effect: 'chunk' }, theme };

export const raw: FluxdownRawProps = { ...props, plugins };

export type Handle = FluxdownRef;

export const componentProps: InstanceType<typeof FluxdownRaw>['$props'] = { text: 'consumer', plugins };

// @ts-expect-error Raw requires an explicit plugin selection.
export const missingPlugins: FluxdownRawProps = { text: 'consumer' };

// @ts-expect-error The generated component declaration must retain required Raw plugins.
export const missingComponentPlugins: InstanceType<typeof FluxdownRaw>['$props'] = { text: 'consumer' };

// @ts-expect-error A renderer-specific effect name is not a built-in effect.
export const invalidEffect: FluxdownProps = { text: 'consumer', streaming: { effect: 'invalid' } };
`
    : ''
}`,
    ),
    writeFile(
      path.join(directory, 'tsconfig.consumer.json'),
      JSON.stringify({
        compilerOptions: {
          module: 'ESNext',
          moduleResolution: 'Bundler',
          target: 'ES2022',
          lib: ['ES2022', 'DOM'],
          strict: true,
          skipLibCheck: true,
          noEmit: true,
          ignoreDeprecations: '6.0',
        },
        files: ['consumer-types.ts'],
      }),
    ),
    writeFile(
      path.join(directory, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ESNext',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          allowJs: true,
        },
        include: ['src/**/*'],
      }),
    ),
  ]);

  run(process.execPath, [
    'node_modules/vue-tsc/bin/vue-tsc.js',
    '--noEmit',
    '-p',
    'tsconfig.consumer.json',
  ]);

  const buildOutput = run(
    process.execPath,
    ['node_modules/@dcloudio/vite-plugin-uni/bin/uni.js', 'build', '-p', 'h5'],
    { UNI_APP_X: 'true' },
  );

  // The CLI can print UTS diagnostics while returning a successful exit code.
  assert(
    !/\berror\s+TS\d+|Cannot find module:|Build failed/.test(stripVTControlCharacters(buildOutput)),
    buildOutput,
  );

  const output = path.join(directory, 'dist/build/h5');

  const webAssets = (await filesUnder(output)).filter((file) => /\.(js|css|html)$/.test(file));

  assert(webAssets.includes('index.html'), 'uni-app consumer did not emit an HTML entry');

  assert(
    webAssets.some((file) => file.endsWith('.js')),
    'uni-app consumer did not emit JavaScript',
  );

  await Promise.all(
    webAssets.map(async (file) => {
      assert((await readFile(path.join(output, file))).length, `Empty uni-app asset: ${file}`);
    }),
  );

  console.log(
    `uni-app consumer OK: ${specifiers.length} public entries, strict declarations, and official H5 compilation`,
  );

  return {
    specifiers,
    typeEntries: specifiers.length,
    webAssets,
    compilerVersion: COMPILER_VERSION,
  };
}
