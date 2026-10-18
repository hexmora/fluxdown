import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ReleaseArtifactManifest } from './release-artifact.ts';

import {
  PUBLIC_PACKAGES,
  RELEASE_REGISTRY,
  RELEASE_REPOSITORY,
  validateReleaseManifest,
  validateStableCandidate,
} from './release-artifact.ts';

const artifact = (
  verification: ReleaseArtifactManifest['verification'],
  name = '@fluxdown/core',
): ReleaseArtifactManifest => ({
  schemaVersion: 1,
  repository: RELEASE_REPOSITORY,
  sourceSha: 'a'.repeat(40),
  channel: 'stable',
  tag: 'latest',
  registry: RELEASE_REGISTRY,
  runId: '1',
  runAttempt: 1,
  publishable: false,
  tools: { node: '24', npm: '11', pnpm: '11', changesets: '2' },
  verification,
  packages: [
    {
      name,
      version: '0.1.0',
      tarball: 'tarballs/package.tgz',
      sha256: 'a'.repeat(64),
      integrity: `sha512-${'A'.repeat(86)}==`,
      contentHash: 'b'.repeat(64),
      files: ['dist/index.js', 'package.json'],
    },
  ],
});

test('older Node-verified release artifacts remain valid without native declaration metadata', () => {
  const manifest = artifact({ nodeEntries: 1, browser: [] });
  assert.equal(validateReleaseManifest(manifest), manifest);
});

test('native-only releases can record declaration verification without claiming Node execution', () => {
  for (const name of ['@fluxdown/react-native', '@fluxdown/react-native-presets']) {
    const manifest = artifact({ nodeEntries: 0, nativeTypeEntries: 4, browser: [] }, name);
    assert.equal(validateReleaseManifest(manifest), manifest);
  }
});

test('missing or malformed consumer verification remains rejected', () => {
  assert.throws(
    () => validateReleaseManifest(artifact({ nodeEntries: 0, browser: [] })),
    /Missing consumer verification/,
  );
  for (const count of [0, -1, 1.5, NaN]) {
    assert.throws(
      () =>
        validateReleaseManifest(
          artifact({ nodeEntries: 1, nativeTypeEntries: count, browser: [] }),
        ),
      /Invalid native declaration verification/,
    );
  }
});

test('base and native packages are approved for versioned stable release candidates', () => {
  const names = [
    '@fluxdown/react-base',
    '@fluxdown/react-base-presets',
    '@fluxdown/react-native',
    '@fluxdown/react-native-presets',
  ];
  for (const name of names)
    assert(PUBLIC_PACKAGES.includes(name as (typeof PUBLIC_PACKAGES)[number]));
  const candidate = {
    schemaVersion: 1,
    repository: RELEASE_REPOSITORY,
    baseSha: 'a'.repeat(40),
    headSha: 'b'.repeat(40),
    prepareRunId: '1',
    prNumber: 1,
    packages: names.map((name) => ({ name, previousVersion: '0.0.0', version: '0.1.0' })),
  };
  assert.equal(validateStableCandidate(candidate), candidate);
});
