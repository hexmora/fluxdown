/* eslint-disable no-console -- Report packed Angular consumer verification in release logs. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AngularCheckResult, PackageArtifact } from './types.ts';

import { filesUnder, isAngularPackage, publicEntries, readManifest } from './check-package.ts';

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

export async function checkAngularConsumer(
  consumer: string,
  artifacts: PackageArtifact[],
): Promise<AngularCheckResult | undefined> {
  const selected = artifacts.filter(({ manifest }) => isAngularPackage(manifest.name));

  const specifiers = selected.flatMap(({ manifest, files }) =>
    publicEntries(manifest, files).map(
      ([entry]) => manifest.name + (entry === '.' ? '' : entry.slice(1)),
    ),
  );

  if (!specifiers.length) return;

  // Keep this Angular/TypeScript dependency tree separate from the Node and other framework checks.
  const directory = path.join(consumer, 'angular-consumer');

  await mkdir(directory, { recursive: true });

  for (let index = 0; index < selected.length; index += 1) {
    for (const name of Object.keys(selected[index].manifest.dependencies ?? {})) {
      const dependency = artifacts.find(({ manifest }) => manifest.name === name);

      if (dependency && !selected.includes(dependency)) selected.push(dependency);
    }
  }

  const tools = await Promise.all(
    [
      '@angular/build',
      '@angular/cli',
      '@angular/common',
      '@angular/compiler',
      '@angular/compiler-cli',
      '@angular/core',
      '@angular/platform-browser',
      'jsdom',
      'rxjs',
      'typescript',
    ].map(async (name) => {
      const manifest = await readManifest(path.join(root, 'packages/angular/node_modules', name));

      return [name, manifest.version];
    }),
  );

  const renderer = selected.find(({ manifest }) => manifest.name === '@fluxdown/angular');
  const pluginsRange = renderer?.manifest.dependencies?.['@fluxdown/angular-plugins'];

  assert(!renderer || pluginsRange, 'Angular renderer must declare its plugin dependency');

  await writeFile(
    path.join(directory, 'package.json'),
    JSON.stringify({
      name: 'fluxdown-angular-consumer',
      private: true,
      type: 'module',
      dependencies: {
        ...Object.fromEntries(tools),
        // The Raw fixture imports this package directly, including wrapper-only releases.
        ...(pluginsRange ? { '@fluxdown/angular-plugins': pluginsRange } : {}),
        ...Object.fromEntries(
          selected.map(({ manifest, tarball }) => [manifest.name, `file:${tarball}`]),
        ),
      },
      overrides: Object.fromEntries(
        selected.map(({ manifest }) => [manifest.name, `$${manifest.name}`]),
      ),
    }),
  );

  run(directory, 'npm', [
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--no-package-lock',
  ]);

  run(directory, 'npm', ['ls', '--all', '--json']);

  const hasRenderer = specifiers.includes('@fluxdown/angular');

  const imports = specifiers
    .map((specifier, index) => `import * as Entry${index} from ${JSON.stringify(specifier)};`)
    .join('\n');

  const entries = specifiers.map((_, index) => `Entry${index}`).join(', ');

  await writeFile(
    path.join(directory, 'main.ts'),
    `${imports}
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
${
  hasRenderer
    ? `import { Fluxdown } from '@fluxdown/angular';
import { FluxdownLite } from '@fluxdown/angular/lite';
import { FluxdownRaw } from '@fluxdown/angular/raw';
import { PRESET_LITE_PLUGINS } from '@fluxdown/angular-plugins/lite';`
    : `import { AngularDomRenderer, createComponentNode, RenderContext, RenderOutlet } from '@fluxdown/angular-plugins/base';
import { ParagraphSlotPlugin } from '@fluxdown/angular-plugins/plugins/paragraph';`
}

@Component({
  selector: 'consumer-app',
  imports: [${hasRenderer ? 'Fluxdown, FluxdownLite, FluxdownRaw' : 'RenderOutlet'}],
  ${hasRenderer ? '' : 'providers: [AngularDomRenderer, RenderContext],'}
  template: ${JSON.stringify(
    hasRenderer
      ? `<fluxdown [text]="text" /><fluxdown-lite [text]="text" /><fluxdown-raw [text]="text" [plugins]="plugins" />
@for (effect of effects; track effect) { <fluxdown-lite text="Effect consumer" [streaming]="{ effect, smooth: false }" /> }`
      : '<ng-container [fluxdownRender]="node" />',
  )},
})
class ConsumerApp {
  ${
    hasRenderer
      ? `readonly text = '# Angular consumer\\n\\nA **packed** package.';
  readonly plugins = PRESET_LITE_PLUGINS;
  readonly effects = ['scale', 'shad', 'chunk', 'suffix'] as const;`
      : `readonly node = createComponentNode(new ParagraphSlotPlugin().Component, {}, {
    tagName: 'p', children: 'Angular plugin consumer',
  });`
  }
}

Object.assign(globalThis, { angularConsumerEntries: [${entries}] });

bootstrapApplication(ConsumerApp).then(async (app) => {
  await app.whenStable();

  Object.assign(globalThis, { angularConsumerReady: true });
});
`,
  );

  await writeFile(
    path.join(directory, 'types.ts'),
    `${
      hasRenderer
        ? `import type { FluxdownLiteProps } from '@fluxdown/angular/lite';
import type { FluxdownRawProps } from '@fluxdown/angular/raw';

const props: FluxdownLiteProps = {
  text: 'consumer',
  plugins: { config: { 'slot-paragraph': { disabled: true }, 'render-heading': { disabled: false } } },
  streaming: { effect: ['scale', 'shad', 'chunk', 'suffix'], smooth: false },
};

void props;

// @ts-expect-error Raw requires an explicit plugin selection.
const missingPlugins: FluxdownRawProps = { text: 'consumer' };

void missingPlugins;
`
        : `import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

const plugin: IPluginItem = { config: { 'slot-paragraph': { disabled: true }, 'render-heading': { disabled: false } } };

void plugin;
`
    }
${hasRenderer ? "type Config = NonNullable<Exclude<FluxdownLiteProps['plugins'], unknown[]>>['config'];" : "type Config = IPluginItem['config'];"}

// @ts-expect-error Unknown plugin keys must remain invalid without importing individual plugins.
const unknownKey: Config = { 'slot-not-a-plugin': { disabled: true } };

void unknownKey;
`,
  );

  const compilerOptions = {
    target: 'ES2022',
    module: 'ESNext',
    moduleResolution: 'Bundler',
    lib: ['ES2022', 'DOM'],
    strict: true,
    skipLibCheck: false,
    experimentalDecorators: true,
    types: [],
  };

  await writeFile(
    path.join(directory, 'tsconfig.types.json'),
    JSON.stringify({ compilerOptions: { ...compilerOptions, noEmit: true }, files: ['types.ts'] }),
  );

  run(directory, process.execPath, [
    'node_modules/typescript/bin/tsc',
    '-p',
    'tsconfig.types.json',
  ]);

  await writeFile(
    path.join(directory, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions,
      angularCompilerOptions: {
        strictTemplates: true,
        strictInjectionParameters: true,
        strictInputAccessModifiers: true,
      },
      files: ['main.ts'],
    }),
  );

  await writeFile(
    path.join(directory, 'angular.json'),
    JSON.stringify({
      version: 1,
      cli: { analytics: false },
      projects: {
        consumer: {
          projectType: 'application',
          root: '',
          architect: {
            build: {
              builder: '@angular/build:application',
              options: {
                browser: 'main.ts',
                index: 'index.html',
                tsConfig: 'tsconfig.json',
                outputPath: 'dist',
                optimization: true,
                outputHashing: 'none',
              },
            },
          },
        },
      },
    }),
  );

  await writeFile(
    path.join(directory, 'index.html'),
    '<!doctype html><html><head><title>Angular consumer</title></head><body><consumer-app></consumer-app></body></html>\n',
  );

  run(directory, process.execPath, ['node_modules/@angular/cli/bin/ng.js', 'build']);

  const files = await filesUnder(path.join(directory, 'dist/browser'));

  const bundles = await Promise.all(
    files
      .filter((file) => file.endsWith('.js'))
      .map((file) => readFile(path.join(directory, 'dist/browser', file), 'utf8')),
  );

  const output = bundles.join('\n');

  for (const selector of [
    'paragraph-root',
    ...(hasRenderer
      ? ['root', 'effect-scale', 'effect-shad', 'effect-chunk', 'effect-suffix']
      : []),
  ]) {
    assert(output.includes(`fluxdown-angular-${selector}`), `Missing Angular ${selector} styles`);
  }

  await writeFile(
    path.join(directory, 'verify.mjs'),
    `import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<consumer-app></consumer-app>', { url: 'http://localhost/', pretendToBeVisual: true });

for (const key of ['window', 'document', 'Node', 'HTMLElement', 'Element', 'Event', 'MouseEvent', 'requestAnimationFrame', 'cancelAnimationFrame']) {
  Object.defineProperty(globalThis, key, { configurable: true, value: typeof dom.window[key] === 'function' && key.endsWith('AnimationFrame') ? dom.window[key].bind(dom.window) : dom.window[key] });
}

try {
  await import('./dist/browser/main.js');

  const deadline = Date.now() + 10000;

  while (!globalThis.angularConsumerReady && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 10));

  assert(globalThis.angularConsumerReady, 'Angular application did not bootstrap');

  assert.equal(globalThis.angularConsumerEntries.length, ${specifiers.length});

  ${hasRenderer ? "assert.equal(document.querySelectorAll('h1').length, 3);\n  assert.equal(document.querySelectorAll('strong').length, 3);" : "assert.equal(document.querySelector('p')?.textContent, 'Angular plugin consumer');"}
} finally {
  dom.window.close();
}
`,
  );

  run(directory, process.execPath, ['verify.mjs']);

  console.log(
    `Angular consumer OK: ${specifiers.length} public entries, strict declarations, AOT, styles, and rendering`,
  );

  return { specifiers, declarations: true, aot: true, styles: true, rendered: true };
}
