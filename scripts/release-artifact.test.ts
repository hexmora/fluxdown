import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ReleaseArtifactManifest } from './release-artifact.ts';
import type { LynxCheckResult, SvelteCheckResult } from './types.ts';

import { validateReleaseManifest } from './release-artifact.ts';

function lynxVerification(names = ['@fluxdown/lynx']): LynxCheckResult {
  return {
    specifiers: names,
    typeEntries: names.length,
    nativeAssets: ['main.lynx.bundle'],
    webAssets: ['main.web.bundle'],
  };
}

function manifest(names = ['@fluxdown/lynx']): ReleaseArtifactManifest {
  return {
    schemaVersion: 1,
    repository: 'hexmora/fluxdown',
    sourceSha: 'a'.repeat(40),
    channel: 'stable',
    tag: 'latest',
    registry: 'https://registry.npmjs.org/',
    runId: '123',
    runAttempt: 1,
    publishable: false,
    tools: { node: '24.14.1', npm: '11.15.0', pnpm: '11.6.0', changesets: '3.0.2' },
    verification: { nodeEntries: 0, browser: [], lynx: lynxVerification(names) },
    packages: names.map((name, index) => ({
      name,
      version: '0.3.0',
      tarball: `tarballs/package-${index}.tgz`,
      sha256: 'a'.repeat(64),
      integrity: `sha512-${'A'.repeat(86)}==`,
      contentHash: 'b'.repeat(64),
      files: ['package.json'],
    })),
  };
}

test('accepts existing artifacts without Lynx evidence for recovery', () => {
  const artifact = manifest(['fluxdown', '@fluxdown/lynx']);

  artifact.verification = { nodeEntries: 4, browser: [] };

  assert.equal(validateReleaseManifest(artifact), artifact);
});

test('accepts Lynx-only artifacts after native, web, and declaration verification', () => {
  const artifact = manifest(['@fluxdown/lynx', '@fluxdown/lynx-plugins']);

  artifact.verification.lynx = lynxVerification([
    '@fluxdown/lynx',
    '@fluxdown/lynx/lite',
    '@fluxdown/lynx-plugins',
    '@fluxdown/lynx-plugins/plugins/tex-svg',
  ]);

  assert.equal(validateReleaseManifest(artifact), artifact);
});

test('accepts a mixed release with both Node and Lynx verification', () => {
  const artifact = manifest(['fluxdown', '@fluxdown/lynx']);

  artifact.verification.nodeEntries = 1;
  artifact.verification.lynx = lynxVerification();

  assert.equal(validateReleaseManifest(artifact), artifact);
});

test('rejects zero consumer entries without Lynx verification', () => {
  const artifact = manifest();

  artifact.verification = { nodeEntries: 0, browser: [] };

  assert.throws(() => validateReleaseManifest(artifact), /Missing consumer verification/);
});

for (const name of ['fluxdown', '@fluxdown/react-native']) {
  test(`Lynx verification cannot replace Node verification for ${name}`, () => {
    const artifact = manifest(['@fluxdown/lynx', name]);

    artifact.verification.lynx = lynxVerification();

    assert.throws(() => validateReleaseManifest(artifact), /Missing consumer verification/);
  });
}

for (const nodeEntries of [-1, 0.5, NaN, Infinity, '0']) {
  test(`rejects invalid Node entry count ${String(nodeEntries)}`, () => {
    const artifact = manifest();

    assert.throws(
      () =>
        validateReleaseManifest({
          ...artifact,
          verification: { ...artifact.verification, nodeEntries },
        }),
      /Invalid Node consumer entry count/,
    );
  });
}

const incompleteEvidence = [
  ['empty object', {}],
  ['empty entries', { ...lynxVerification(), specifiers: [], typeEntries: 0 }],
  ['missing declarations', { ...lynxVerification(), typeEntries: undefined }],
  ['incomplete declarations', { ...lynxVerification(), typeEntries: 0 }],
  ['extra declarations', { ...lynxVerification(), typeEntries: 2 }],
  ['missing native bundle', { ...lynxVerification(), nativeAssets: undefined }],
  ['empty native bundles', { ...lynxVerification(), nativeAssets: [] }],
  ['missing web bundle', { ...lynxVerification(), webAssets: undefined }],
  ['empty web bundles', { ...lynxVerification(), webAssets: [] }],
  ['null evidence', null],
] as const;

for (const [label, lynx] of incompleteEvidence) {
  test(`rejects ${label}`, () => {
    const artifact = manifest();

    assert.throws(() =>
      validateReleaseManifest({
        ...artifact,
        verification: { ...artifact.verification, lynx },
      }),
    );
  });
}

for (const specifiers of [
  ['@fluxdown/lynx', '@fluxdown/lynx'],
  ['@fluxdown/lynx/lite'],
  ['@fluxdown/lynx', '@fluxdown/lynx-plugins'],
  ['@fluxdown/lynx', '@fluxdown/core'],
  ['@fluxdown/lynx', '@fluxdown/lynx-other'],
  ['@fluxdown/lynx', '@fluxdown/lynx/../core'],
  ['@fluxdown/lynx', '@fluxdown/lynx/'],
]) {
  test(`rejects entries outside the verified artifact: ${specifiers.join(', ')}`, () => {
    const artifact = manifest();

    artifact.verification.lynx = lynxVerification(specifiers);

    assert.throws(() => validateReleaseManifest(artifact));
  });
}

test('requires evidence for every Lynx package in the artifact', () => {
  const artifact = manifest(['@fluxdown/lynx', '@fluxdown/lynx-plugins']);

  artifact.verification.lynx = lynxVerification();

  assert.throws(() => validateReleaseManifest(artifact), /Missing Lynx package verification/);
});

for (const field of ['nativeAssets', 'webAssets'] as const) {
  for (const assets of [['main.bundle', 'main.bundle'], ['../main.bundle'], ['/main.bundle']]) {
    test(`rejects duplicate or unsafe ${field}: ${assets.join(', ')}`, () => {
      const artifact = manifest();

      artifact.verification.lynx = { ...lynxVerification(), [field]: assets };

      assert.throws(() => validateReleaseManifest(artifact));
    });
  }
}

test('validates supplied Lynx evidence even when Node checks passed', () => {
  const artifact = manifest();

  artifact.verification.nodeEntries = 1;
  artifact.verification.lynx = { ...lynxVerification(), webAssets: [] };

  assert.throws(() => validateReleaseManifest(artifact), /Missing Lynx webAssets/);
});

function taroVerification(names = ['@fluxdown/taro', '@fluxdown/taro-plugins']) {
  return names.flatMap((name) =>
    (['import', 'require'] as const).map((format) => ({
      specifier: name === '@fluxdown/taro-plugins' ? `${name}/lite` : name,
      format,
      cssAssets: ['static/css/consumer.css'],
      selectors: 4,
      cssBytes: 120,
    })),
  );
}

test('accepts Taro-only artifacts after both browser module formats load their styles', () => {
  const artifact = manifest(['@fluxdown/taro', '@fluxdown/taro-plugins']);

  artifact.verification = { nodeEntries: 0, browser: taroVerification() };

  assert.equal(validateReleaseManifest(artifact), artifact);
});

test('requires browser evidence for each Taro package even when Node entries passed', () => {
  const artifact = manifest(['fluxdown', '@fluxdown/taro', '@fluxdown/taro-plugins']);

  artifact.verification = { nodeEntries: 1, browser: taroVerification(['@fluxdown/taro']) };

  assert.throws(() => validateReleaseManifest(artifact), /Missing Taro browser verification/);
});

test('Taro browser evidence cannot replace Node verification for another renderer', () => {
  const artifact = manifest(['fluxdown', '@fluxdown/taro']);

  artifact.verification = { nodeEntries: 0, browser: taroVerification(['@fluxdown/taro']) };

  assert.throws(() => validateReleaseManifest(artifact), /Missing consumer verification/);
});

for (const field of ['cssBytes', 'selectors', 'cssAssets', 'format'] as const) {
  test(`rejects incomplete Taro browser evidence: ${field}`, () => {
    const artifact = manifest(['@fluxdown/taro']);

    const browser = taroVerification(['@fluxdown/taro']);

    artifact.verification = {
      nodeEntries: 0,
      browser: browser.map((entry) => ({ ...entry, [field]: undefined })),
    };

    assert.throws(() => validateReleaseManifest(artifact), /Missing Taro browser verification/);
  });
}

function svelteVerification(): SvelteCheckResult {
  return {
    specifiers: ['@fluxdown/svelte', '@fluxdown/svelte/lite', '@fluxdown/svelte-plugins/lite'],
    client: true,
    server: true,
    declarations: true,
    styles: true,
  };
}

test('accepts Svelte-only artifacts after component, server, declaration, and style verification', () => {
  const artifact = manifest(['@fluxdown/svelte', '@fluxdown/svelte-plugins']);

  artifact.verification = { nodeEntries: 0, browser: [], svelte: svelteVerification() };

  assert.equal(validateReleaseManifest(artifact), artifact);
});

test('accepts mixed Svelte and Native artifacts when each selected package was verified', () => {
  const artifact = manifest([
    '@fluxdown/svelte',
    '@fluxdown/svelte-plugins',
    '@fluxdown/react-native',
  ]);

  artifact.verification = {
    nodeEntries: 0,
    browser: [],
    svelte: svelteVerification(),
    native: { packages: ['@fluxdown/react-native'] },
  };

  assert.equal(validateReleaseManifest(artifact), artifact);
});

test('accepts the Svelte plugin package through its subpath exports without a root entry', () => {
  const artifact = manifest(['@fluxdown/svelte-plugins']);

  artifact.verification = {
    nodeEntries: 0,
    browser: [],
    svelte: { ...svelteVerification(), specifiers: ['@fluxdown/svelte-plugins/lite'] },
  };

  assert.equal(validateReleaseManifest(artifact), artifact);
});

test('requires Native verification in a mixed Svelte and Native artifact', () => {
  const artifact = manifest([
    '@fluxdown/svelte',
    '@fluxdown/svelte-plugins',
    '@fluxdown/react-native',
  ]);

  artifact.verification = { nodeEntries: 0, browser: [], svelte: svelteVerification() };

  assert.throws(() => validateReleaseManifest(artifact), /Missing consumer verification/);
});

test('requires Svelte verification even when Node entries passed', () => {
  const artifact = manifest(['@fluxdown/svelte']);

  artifact.verification = { nodeEntries: 1, browser: [] };

  assert.throws(() => validateReleaseManifest(artifact), /Svelte verification/);
});

test('Svelte verification cannot replace verification for another package', () => {
  const artifact = manifest(['@fluxdown/svelte', '@fluxdown/svelte-plugins', '@fluxdown/core']);

  artifact.verification = { nodeEntries: 0, browser: [], svelte: svelteVerification() };

  assert.throws(() => validateReleaseManifest(artifact), /Missing consumer verification/);
});

for (const field of ['client', 'server', 'declarations', 'styles'] as const) {
  test(`rejects missing Svelte ${field} verification`, () => {
    const artifact = manifest(['@fluxdown/svelte', '@fluxdown/svelte-plugins']);

    artifact.verification = {
      nodeEntries: 0,
      browser: [],
      svelte: { ...svelteVerification(), [field]: false },
    };

    assert.throws(() => validateReleaseManifest(artifact), /Missing Svelte .* verification/);
  });
}

for (const specifiers of [
  [],
  ['@fluxdown/svelte', '@fluxdown/svelte'],
  ['@fluxdown/svelte'],
  ['@fluxdown/svelte', '@fluxdown/svelte-plugins-other/lite'],
  ['@fluxdown/svelte', '@fluxdown/svelte-plugins/../core'],
]) {
  test(`rejects incomplete or unrelated Svelte entries: ${specifiers.join(', ')}`, () => {
    const artifact = manifest(['@fluxdown/svelte', '@fluxdown/svelte-plugins']);

    artifact.verification = {
      nodeEntries: 0,
      browser: [],
      svelte: { ...svelteVerification(), specifiers },
    };

    assert.throws(() => validateReleaseManifest(artifact));
  });
}

test('accepts Native-only artifacts after the packed Native consumer passed', () => {
  const artifact = manifest(['@fluxdown/react-native']);

  artifact.verification = {
    nodeEntries: 0,
    browser: [],
    native: { packages: ['@fluxdown/react-native'] },
  };

  assert.equal(validateReleaseManifest(artifact), artifact);
});

for (const packages of [
  [],
  ['@fluxdown/react-native', '@fluxdown/react-native'],
  ['@fluxdown/react-native', '@fluxdown/react-native-plugins'],
  ['@fluxdown/core'],
]) {
  test(`rejects incomplete or unrelated Native packages: ${packages.join(', ')}`, () => {
    const artifact = manifest(['@fluxdown/react-native']);

    artifact.verification = { nodeEntries: 1, browser: [], native: { packages } };

    assert.throws(() => validateReleaseManifest(artifact));
  });
}
