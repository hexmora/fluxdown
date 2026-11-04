/* eslint-disable no-await-in-loop -- Verify published entry formats independently. */
/* eslint-disable no-console -- Report native consumer verification in release logs. */
import { createRsbuild } from '@rsbuild/core';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { PackageArtifact } from './types.ts';

import { reactNativeWebPlugin } from './build/react-native-web.ts';
import { publicEntries } from './check-package.ts';

export const REACT_NATIVE_PACKAGES = ['@fluxdown/react-native-plugins', '@fluxdown/react-native'];

export async function checkReactNativePacks(consumer: string, artifacts: PackageArtifact[]) {
  const specifiers = artifacts.flatMap(({ manifest, files }) =>
    publicEntries(manifest, files).map(
      ([entry]) => manifest.name + (entry === '.' ? '' : entry.slice(1)),
    ),
  );

  const imports = specifiers
    .map(
      (specifier, index) => `import * as Entry${index} from '${specifier}';

void Entry${index};`,
    )
    .join('\n');

  const typeSmoke = `
import { Fluxdown, type FluxdownProps } from '@fluxdown/react-native';
import { FluxdownLite } from '@fluxdown/react-native/lite';
import { FluxdownRaw } from '@fluxdown/react-native/raw';
import { PRESET_LITE_PLUGINS } from '@fluxdown/react-native-plugins/lite';
import { ParagraphPlugin } from '@fluxdown/react-native-plugins/plugins/paragraph';
import { ChunkRenderer } from '@fluxdown/react-native-plugins/plugins/effect-chunk';
import { ScaleRenderer } from '@fluxdown/react-native-plugins/plugins/effect-scale';
import { ShadRenderer } from '@fluxdown/react-native-plugins/plugins/effect-shad';
import { SuffixRenderer } from '@fluxdown/react-native-plugins/plugins/effect-suffix';
import type { IPluginItem } from '@fluxdown/react-base-plugins/typings';
import { createElement } from 'react';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({ root: { padding: 16 } });

const props: FluxdownProps = { text: '# Native', style: [styles.root, { flex: 1 }], theme: 'dark' };

const plugins: IPluginItem[] = [...PRESET_LITE_PLUGINS, ParagraphPlugin];

createElement(Fluxdown, props);

createElement(FluxdownLite, props);

createElement(FluxdownRaw, { ...props, plugins });

createElement(ChunkRenderer, { Raw: null, start: 0, duration: 400 }, 'chunk');

createElement(ScaleRenderer, { Raw: null, start: 0, duration: 400, from: 0, blur: 0.08 }, 'scale');

createElement(ShadRenderer, { Raw: null, start: 0, duration: 400 }, 'shad');

createElement(SuffixRenderer, { Raw: null, type: 'cursor' });

// @ts-expect-error Raw requires an explicit plugin selection.
createElement(FluxdownRaw, { text: 'native consumer' });

// @ts-expect-error Native containers accept View styles rather than CSS class names.
createElement(FluxdownLite, { text: 'native consumer', className: 'container' });

// @ts-expect-error Padding must use a React Native dimension value.
createElement(FluxdownLite, { text: 'native consumer', style: { padding: true } });
`;

  for (const extension of ['mts', 'cts']) {
    await writeFile(
      path.join(consumer, '__tests__', `native-types.${extension}`),
      imports + typeSmoke,
    );
  }

  await writeFile(
    path.join(consumer, 'tsconfig.native.json'),
    JSON.stringify({
      compilerOptions: {
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        target: 'ES2022',
        lib: ['ES2022'],
        types: ['react', 'react-native'],
        strict: true,
        noEmit: true,
        // Match React Native's official config; its generated declarations
        // contain upstream errors even with no application imports.
        skipLibCheck: true,
        jsx: 'react-jsx',
      },
      files: ['__tests__/native-types.mts', '__tests__/native-types.cts'],
    }),
  );

  for (const format of ['import', 'require'] as const) {
    const name = `native-${format}`;

    const file = path.join(consumer, `${name}.${format === 'import' ? 'mjs' : 'cjs'}`);

    const entries = specifiers
      .map((specifier, index) =>
        format === 'import'
          ? `import * as Entry${index} from '${specifier}';

globalThis['entry${index}'] = Entry${index};`
          : `globalThis['entry${index}'] = require('${specifier}');`,
      )
      .join('\n');

    const load = (names: string, specifier: string) =>
      format === 'import'
        ? `import { ${names} } from '${specifier}';`
        : `const { ${names} } = require('${specifier}');`;

    await writeFile(
      file,
      `${entries}
${load('createElement', 'react')}
${load('renderToPipeableStream, renderToStaticMarkup', 'react-dom/server')}
${load('PassThrough', 'node:stream')}
${load('Fluxdown', '@fluxdown/react-native')}
${load('FluxdownLite', '@fluxdown/react-native/lite')}
${load('PRESET_LITE_PLUGINS', '@fluxdown/react-native-plugins/lite')}
${load('ParagraphPlugin', '@fluxdown/react-native-plugins/plugins/paragraph')}
${load('ChunkRenderer', '@fluxdown/react-native-plugins/plugins/effect-chunk')}
${load('ScaleRenderer', '@fluxdown/react-native-plugins/plugins/effect-scale')}
${load('ShadRenderer', '@fluxdown/react-native-plugins/plugins/effect-shad')}
${load('SuffixRenderer', '@fluxdown/react-native-plugins/plugins/effect-suffix')}
${load('Svg, Defs, Filter, FeGaussianBlur, Mask, Rect', 'react-native-svg')}
if (!PRESET_LITE_PLUGINS.includes(ParagraphPlugin)) throw new Error('Native plugin identity differs between entries');

const output = renderToStaticMarkup(createElement(FluxdownLite, { text: '# Native consumer\\n\\n**Shared** renderer' }));

// Native text can span multiple inline elements; verify the fixture's text independently of its markup.
const text = output.replace(/<[^>]*>/g, '');

if (!text.includes('Native consumer') || !text.includes('Shared renderer')) throw new Error('Native web consumer did not render');

// SSR verifies public slots and initial state, without advancing animation frames.
// Native layout and animated SVG updates are covered by renderer tests.
const start = performance.now() + 1000;

for (const [Component, props, label] of [
  [ChunkRenderer, { Raw: null, start, duration: 400 }, 'chunk'],
  [ShadRenderer, { Raw: null, start, duration: 400 }, 'shad'],
  [ScaleRenderer, { Raw: null, start, duration: 400, from: 0, blur: 0.08 }, 'scale'],
]) {
  const html = renderToStaticMarkup(createElement(Component, props, label));

  const glyph = html.match(new RegExp('<span[^>]*style="([^"]*)"[^>]*>' + label + '</span>'));

  if (!glyph || !/color:rgba\\(\\d+,\\d+,\\d+,0(?:\\.0+)?\\)/.test(glyph[1])) {
    throw new Error('Native ' + label + ' did not preserve its initial animation state');
  }
}

for (const type of ['cursor', 'dot']) {
  const html = renderToStaticMarkup(createElement(SuffixRenderer, { Raw: null, type }));

  if (html.includes('<svg') || !html.includes('width:0') || !html.includes('border-top-left-radius:')) {
    throw new Error('Native suffix ' + type + ' did not render its inline marker');
  }
}

const svg = renderToStaticMarkup(createElement(Svg, { width: 100, height: 24 },
  createElement(Defs, null,
    createElement(Filter, { id: 'blur' }, createElement(FeGaussianBlur, { stdDeviation: 1 })),
    createElement(Mask, { id: 'fade' }, createElement(Rect, { width: 100, height: 24, fill: 'white' })),
  ),
  createElement(Rect, { width: 100, height: 24, filter: 'url(#blur)', mask: 'url(#fade)' }),
));

for (const element of ['svg', 'filter', 'feGaussianBlur', 'mask']) {
  if (!svg.includes('<' + element)) throw new Error('Native SVG primitive ' + element + ' is unavailable');
}

async function checkFull() {
  let html = '';

  await new Promise((resolve, reject) => {
    const destination = new PassThrough();

    const timer = setTimeout(() => {
      stream.abort();

      reject(new Error('Native Full SSR timed out'));
    }, 10000);

    destination.on('data', (chunk) => { html += chunk; });

    destination.on('end', () => {
      clearTimeout(timer);

      resolve();
    });

    destination.on('error', (error) => {
      clearTimeout(timer);

      reject(error);
    });

    const stream = renderToPipeableStream(createElement(Fluxdown, {
      text: '$x^2$\\n\\n~~~javascript\\nconst answer = 42;\\n~~~', build: { tex: true },
    }), {
      onAllReady() { stream.pipe(destination); },
      onError(error) {
        clearTimeout(timer);

        reject(error);
      },
    });
  });

  if (!html.includes('<svg') || !html.includes('<path') || !html.includes('answer')) {
    throw new Error('Native Full lazy renderers did not render');
  }
}

checkFull().catch((error) => {
  console.error(error);

  process.exitCode = 1;
});
`,
    );

    // React Native's own Flow sources require Metro. React Native Web supplies
    // the same public primitives for this isolated npm/SSR consumer check.
    const output = path.join(consumer, name);

    const rsbuild = await createRsbuild({
      cwd: consumer,
      config: {
        mode: 'production',
        source: { entry: { index: file } },
        plugins: [reactNativeWebPlugin(consumer)],
        output: {
          target: 'node',
          module: false,
          distPath: { root: output },
          filename: { js: '[name].cjs' },
          polyfill: 'off',
          externals: ['react', 'react-dom/server'],
        },
        performance: { printFileSize: false },
      },
    });

    const build = await rsbuild.build();

    try {
      const result = spawnSync(process.execPath, [path.join(output, 'index.cjs')], {
        cwd: consumer,
        encoding: 'utf8',
      });

      assert.equal(result.status, 0, result.stderr || result.stdout);
    } finally {
      await build.close();
    }
  }

  const manifest = JSON.parse(
    await readFile(path.join(consumer, 'node_modules/@fluxdown/react-native/package.json'), 'utf8'),
  );

  assert(!manifest.dependencies['react-dom'], 'Native components depend on React DOM');

  assert(
    !manifest.dependencies['@fluxdown/react-plugins'],
    'Native components depend on DOM slots',
  );

  console.log(
    `Native consumer OK: ${specifiers.length} ESM/CJS entries render through React Native Web`,
  );
}
