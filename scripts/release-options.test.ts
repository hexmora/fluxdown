import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseReleaseOptions } from './release.ts';

test('stable dry runs can check an explicit package subset', () => {
  for (const channel of [[], ['--channel', 'stable']]) {
    const options = parseReleaseOptions([
      '--dry-run',
      ...channel,
      '--check-packages',
      'fluxdown',
      '--check-packages',
      '@fluxdown/angular',
    ]);

    assert.deepEqual(options.checkPackages, ['fluxdown', '@fluxdown/angular']);
    assert.equal(options.channel, 'stable');
    assert.equal(options.dryRun, true);
    assert.equal(options.prepare, false);
    assert.equal(options.publish, false);
  }
});

test('unfiltered dry runs retain the full-package default', () => {
  assert.equal(parseReleaseOptions([]).checkPackages, undefined);
  assert.equal(parseReleaseOptions(['--dry-run']).checkPackages, undefined);
});

test('package subsets require explicit dry-run mode and cannot enter release modes', () => {
  for (const args of [
    [],
    ['--dry-run', '--channel', 'beta'],
    ['--prepare', '--candidate', 'candidate.json', '--output', '.release/prepared'],
    ['--prepare', '--dry-run'],
    ['--publish', '--from-artifact', '.release/prepared'],
    ['--publish', '--dry-run', '--from-artifact', '.release/prepared'],
  ]) {
    assert.throws(
      () => parseReleaseOptions([...args, '--check-packages', 'fluxdown']),
      /--check-packages is only allowed with an explicit stable --dry-run/,
    );
  }
});

test('package subsets reject unknown, empty, and duplicate names', () => {
  for (const name of ['unknown', '@fluxdown/website', 'all', 'fluxdown,@fluxdown/angular']) {
    assert.throws(
      () => parseReleaseOptions(['--dry-run', '--check-packages', name]),
      /Unknown --check-packages package/,
    );
  }

  for (const name of ['', ' ']) {
    assert.throws(
      () => parseReleaseOptions(['--dry-run', '--check-packages', name]),
      /requires a nonempty package name/,
    );
  }

  assert.throws(
    () =>
      parseReleaseOptions([
        '--dry-run',
        '--check-packages',
        'fluxdown',
        '--check-packages',
        'fluxdown',
      ]),
    /must not contain duplicate packages/,
  );
  assert.throws(() => parseReleaseOptions(['--dry-run', '--check-packages']));
});

test('package subset checks cannot reuse candidate or artifact inputs', () => {
  assert.throws(
    () =>
      parseReleaseOptions([
        '--dry-run',
        '--check-packages',
        'fluxdown',
        '--candidate',
        'candidate.json',
      ]),
    /--candidate is only valid for stable preparation/,
  );
  assert.throws(
    () =>
      parseReleaseOptions([
        '--dry-run',
        '--check-packages',
        'fluxdown',
        '--from-artifact',
        '.release/prepared',
      ]),
    /--from-artifact requires --publish/,
  );
  assert.throws(
    () => parseReleaseOptions(['--dry-run', '--package', 'fluxdown']),
    /Single-package release commands are disabled/,
  );
});
