import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ReleaseArtifactManifest } from './release-artifact.ts';
import type { LynxCheckResult } from './types.ts';

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

function uniAppVerification(specifiers = ['@fluxdown/uni-app', '@fluxdown/uni-app-plugins/full']) {
  return {
    specifiers,
    typeEntries: specifiers.length,
    compilerVersion: '3.0.0-5030320261023001',
    webAssets: ['assets/consumer.js', 'index.html'],
  };
}

test('accepts uni-app-only artifacts after strict declarations and official H5 compilation', () => {
  const artifact = manifest(['@fluxdown/uni-app', '@fluxdown/uni-app-plugins']);

  artifact.verification = { nodeEntries: 0, browser: [], uniApp: uniAppVerification() };

  assert.equal(validateReleaseManifest(artifact), artifact);
});

test('requires compiler evidence for uni-app even when Node verification passes', () => {
  const artifact = manifest(['fluxdown', '@fluxdown/uni-app']);

  artifact.verification = { nodeEntries: 10, browser: [] };

  assert.throws(() => validateReleaseManifest(artifact), /Invalid uni-app verification/);
});

test('accepts a release containing both target-compiled renderers without Node entries', () => {
  const artifact = manifest(['@fluxdown/lynx', '@fluxdown/uni-app']);

  artifact.verification = {
    nodeEntries: 0,
    browser: [],
    lynx: lynxVerification(),
    uniApp: uniAppVerification(['@fluxdown/uni-app']),
  };

  assert.equal(validateReleaseManifest(artifact), artifact);
});

test('uni-app compilation cannot replace other packages Node verification', () => {
  const artifact = manifest(['fluxdown', '@fluxdown/uni-app']);

  artifact.verification = {
    nodeEntries: 0,
    browser: [],
    uniApp: uniAppVerification(['@fluxdown/uni-app']),
  };

  assert.throws(() => validateReleaseManifest(artifact), /Missing consumer verification/);
});

for (const evidence of [
  { ...uniAppVerification(), compilerVersion: '' },
  { ...uniAppVerification(), typeEntries: 0 },
  { ...uniAppVerification(), webAssets: [] },
  { ...uniAppVerification(), webAssets: ['index.html'] },
  { ...uniAppVerification(), webAssets: ['../consumer.js', 'index.html'] },
  { ...uniAppVerification(), webAssets: ['consumer.js', 'consumer.js', 'index.html'] },
  uniAppVerification(['@fluxdown/uni-app']),
  uniAppVerification(['@fluxdown/uni-app', '@fluxdown/core']),
  uniAppVerification(['@fluxdown/uni-app', '@fluxdown/uni-app', '@fluxdown/uni-app-plugins/full']),
]) {
  test(`rejects incomplete uni-app evidence ${JSON.stringify(evidence)}`, () => {
    const artifact = manifest(['@fluxdown/uni-app', '@fluxdown/uni-app-plugins']);

    artifact.verification = { nodeEntries: 1, browser: [], uniApp: evidence };

    assert.throws(() => validateReleaseManifest(artifact));
  });
}
