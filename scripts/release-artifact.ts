/* eslint-disable no-await-in-loop -- Archive validation and extraction must preserve deterministic ordering. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import semver from 'semver';

import type {
  AngularCheckResult,
  BrowserCheckResult,
  LynxCheckResult,
  ReactNativeCheckResult,
  SvelteCheckResult,
  UniAppCheckResult,
} from './types.ts';

export const RELEASE_REPOSITORY = 'hexmora/fluxdown';
export const RELEASE_REGISTRY = 'https://registry.npmjs.org/';
export const PUBLIC_PACKAGES = [
  'stative',
  '@fluxdown/utils',
  '@fluxdown/hast',
  '@fluxdown/mdast',
  '@fluxdown/types',
  '@fluxdown/core-plugins',
  '@fluxdown/core',
  '@fluxdown/solid-plugins',
  '@fluxdown/solid',
  '@fluxdown/uni-app-plugins',
  '@fluxdown/uni-app',
  '@fluxdown/angular-plugins',
  '@fluxdown/angular',
  '@fluxdown/vue-plugins',
  '@fluxdown/vue',
  '@fluxdown/lynx-plugins',
  '@fluxdown/lynx',
  '@fluxdown/svelte-plugins',
  '@fluxdown/svelte',
  '@fluxdown/react-hooks',
  '@fluxdown/react-base',
  '@fluxdown/react-base-plugins',
  '@fluxdown/react-plugins',
  '@fluxdown/react-native-plugins',
  '@fluxdown/react-native',
  '@fluxdown/taro-plugins',
  '@fluxdown/taro',
  'fluxdown',
] as const;

export type ReleaseChannel = 'stable' | 'beta';

export interface StableCandidate {
  schemaVersion: 1;
  repository: string;
  baseSha: string;
  headSha: string;
  prepareRunId: string;
  prNumber: number;
  packages: { name: string; previousVersion: string; version: string }[];
}

export interface ArtifactPackage {
  name: string;
  version: string;
  tarball: string;
  sha256: string;
  integrity: string;
  files: string[];
  contentHash: string;
}

export interface ReleaseArtifactManifest {
  schemaVersion: 1;
  repository: string;
  sourceSha: string;
  channel: ReleaseChannel;
  tag: 'latest' | 'beta';
  registry: string;
  runId: string;
  runAttempt: number;
  publishable: boolean;
  tools: { node: string; npm: string; pnpm: string; changesets: string };
  candidate?: StableCandidate;
  verification: {
    nodeEntries: number;
    browser: BrowserCheckResult[];
    lynx?: LynxCheckResult;
    svelte?: SvelteCheckResult;
    angular?: AngularCheckResult;
    native?: ReactNativeCheckResult;
    uniApp?: UniAppCheckResult;
  };
  packages: ArtifactPackage[];
}

function record(value: unknown, label: string): Record<string, unknown> {
  assert(value && typeof value === 'object' && !Array.isArray(value), `Invalid ${label}`);

  return value as Record<string, unknown>;
}

function nonempty(value: unknown, label: string): asserts value is string {
  assert(typeof value === 'string' && value.length > 0, `Invalid ${label}`);
}

export function assertSourceSha(value: unknown): asserts value is string {
  assert(typeof value === 'string' && /^[a-f0-9]{40}$/.test(value), 'Expected full source SHA');
}

function assertRunId(value: unknown): asserts value is string {
  assert(typeof value === 'string' && /^[1-9]\d*$/.test(value), 'Invalid release run ID');
}

function assertPackageName(value: unknown): asserts value is string {
  assert(
    typeof value === 'string' && (PUBLIC_PACKAGES as readonly string[]).includes(value),
    `Package is not approved for publication: ${String(value)}`,
  );
}

function assertVersion(value: unknown): asserts value is string {
  assert(typeof value === 'string' && semver.valid(value) === value, 'Invalid package version');
}

export function validateStableCandidate(value: unknown): StableCandidate {
  const candidate = record(value, 'stable candidate');

  assert.equal(candidate.schemaVersion, 1, 'Unsupported candidate schema');
  assert.equal(candidate.repository, RELEASE_REPOSITORY, 'Unexpected candidate repository');
  assertSourceSha(candidate.baseSha);
  assertSourceSha(candidate.headSha);
  assert.notEqual(candidate.baseSha, candidate.headSha, 'Candidate contains no source change');
  assertRunId(candidate.prepareRunId);
  assert(
    Number.isSafeInteger(candidate.prNumber) && Number(candidate.prNumber) > 0,
    'Invalid candidate PR number',
  );
  assert(Array.isArray(candidate.packages) && candidate.packages.length > 0, 'Empty candidate');

  const names = new Set<string>();

  for (const item of candidate.packages) {
    const pkg = record(item, 'candidate package');

    assertPackageName(pkg.name);
    assert(!names.has(pkg.name), `Duplicate candidate package: ${pkg.name}`);
    names.add(pkg.name);
    assertVersion(pkg.previousVersion);
    assertVersion(pkg.version);
    assert(!semver.prerelease(pkg.previousVersion), 'Candidate base version must be stable');
    assert(!semver.prerelease(pkg.version), 'Candidate version must be stable');
    assert(semver.gt(pkg.version, pkg.previousVersion), `${pkg.name}: version did not increase`);
  }

  return candidate as unknown as StableCandidate;
}

export function safeRelativePath(value: unknown): string {
  nonempty(value, 'relative artifact path');
  assert(
    !value.includes('\\') &&
      !value.includes('\0') &&
      !path.posix.isAbsolute(value) &&
      !/^[a-z]:/i.test(value) &&
      value.split('/').every((part) => part !== '' && part !== '.' && part !== '..'),
    `Unsafe artifact path: ${value}`,
  );

  return value;
}

export function betaSuffix(sourceSha: string, runId: string, datetime: string): string {
  assertSourceSha(sourceSha);
  assertRunId(runId);

  assert(/^\d{14}$/.test(datetime), 'Invalid beta datetime');

  return `beta.${datetime}.g${sourceSha}.r${runId}.a1`;
}

function validateLynxVerification(value: unknown, packages: string[]): void {
  const verification = record(value, 'Lynx verification');
  const { specifiers, typeEntries } = verification;

  assert(Array.isArray(specifiers) && specifiers.length > 0, 'Missing Lynx entry verification');
  assert.equal(new Set(specifiers).size, specifiers.length, 'Duplicate Lynx entry verification');

  for (const specifier of specifiers) {
    nonempty(specifier, 'Lynx entry specifier');

    const name = packages.find((pkg) => specifier === pkg || specifier.startsWith(`${pkg}/`));

    assert(name, `Lynx entry does not belong to an artifact package: ${specifier}`);
    if (specifier !== name) safeRelativePath(specifier.slice(name.length + 1));
  }

  for (const name of packages)
    assert(specifiers.includes(name), `Missing Lynx package verification: ${name}`);

  assert.equal(typeEntries, specifiers.length, 'Incomplete Lynx declaration verification');

  for (const field of ['nativeAssets', 'webAssets']) {
    const assets = verification[field];

    assert(Array.isArray(assets) && assets.length > 0, `Missing Lynx ${field}`);
    assert.equal(new Set(assets).size, assets.length, `Duplicate Lynx ${field}`);
    assets.forEach(safeRelativePath);
  }
}

function validateSvelteVerification(value: unknown, packages: string[]): void {
  const verification = record(value, 'Svelte verification');
  const { specifiers } = verification;

  assert(Array.isArray(specifiers) && specifiers.length > 0, 'Missing Svelte entry verification');
  assert.equal(new Set(specifiers).size, specifiers.length, 'Duplicate Svelte entry verification');

  for (const specifier of specifiers) {
    nonempty(specifier, 'Svelte entry specifier');

    const name = packages.find((pkg) => specifier === pkg || specifier.startsWith(`${pkg}/`));

    assert(name, `Svelte entry does not belong to an artifact package: ${specifier}`);

    if (specifier !== name) safeRelativePath(specifier.slice(name.length + 1));
  }

  for (const name of packages) {
    assert(
      specifiers.some((specifier) => specifier === name || specifier.startsWith(`${name}/`)),
      `Missing Svelte package verification: ${name}`,
    );
  }

  for (const field of ['client', 'server', 'declarations', 'styles']) {
    assert.equal(verification[field], true, `Missing Svelte ${field} verification`);
  }
}

function validateAngularVerification(value: unknown, packages: string[]): void {
  const verification = record(value, 'Angular verification');

  const { specifiers } = verification;

  assert(Array.isArray(specifiers) && specifiers.length > 0, 'Missing Angular entry verification');

  assert.equal(new Set(specifiers).size, specifiers.length, 'Duplicate Angular entry verification');

  for (const specifier of specifiers) {
    nonempty(specifier, 'Angular entry specifier');

    const name = packages.find((pkg) => specifier === pkg || specifier.startsWith(`${pkg}/`));

    assert(name, `Angular entry does not belong to an artifact package: ${specifier}`);

    if (specifier !== name) safeRelativePath(specifier.slice(name.length + 1));
  }

  for (const name of packages) {
    const entries =
      name === '@fluxdown/angular'
        ? ['', '/lite', '/raw']
        : ['/base', '/typings', '/full', '/lite'];

    for (const entry of entries) {
      assert(
        specifiers.includes(name + entry),
        `Missing Angular entry verification: ${name}${entry}`,
      );
    }
  }

  for (const field of ['declarations', 'aot', 'styles', 'rendered']) {
    assert.equal(verification[field], true, `Missing Angular ${field} verification`);
  }
}

function validateReactNativeVerification(value: unknown, packages: string[]): void {
  const verification = record(value, 'React Native verification');

  assert(
    Array.isArray(verification.packages) && verification.packages.length > 0,
    'Missing React Native package verification',
  );
  assert.deepEqual(
    [...verification.packages].toSorted(),
    [...packages].toSorted(),
    'React Native verification differs from artifact packages',
  );
}

function validateUniAppVerification(value: unknown, packages: string[]): void {
  const verification = record(value, 'uni-app verification');

  const { specifiers, typeEntries, webAssets } = verification;

  nonempty(verification.compilerVersion, 'uni-app compiler version');

  assert(Array.isArray(specifiers) && specifiers.length > 0, 'Missing uni-app entry verification');

  assert(
    specifiers.every((specifier, index) => specifiers.indexOf(specifier) === index),
    'Duplicate uni-app entry verification',
  );

  for (const specifier of specifiers) {
    nonempty(specifier, 'uni-app entry specifier');

    const name = packages.find((pkg) => specifier === pkg || specifier.startsWith(`${pkg}/`));

    assert(name, `uni-app entry does not belong to an artifact package: ${specifier}`);

    if (specifier !== name) {
      safeRelativePath(specifier.slice(name.length + 1));
    }
  }

  for (const name of packages) {
    assert(
      specifiers.some((specifier) => specifier === name || specifier.startsWith(`${name}/`)),
      `Missing uni-app package verification: ${name}`,
    );
  }

  assert.equal(typeEntries, specifiers.length, 'Incomplete uni-app declaration verification');

  assert(Array.isArray(webAssets) && webAssets.length > 0, 'Missing uni-app web assets');

  assert(
    webAssets.every((asset, index) => webAssets.indexOf(asset) === index),
    'Duplicate uni-app web assets',
  );

  webAssets.forEach(safeRelativePath);

  assert(
    webAssets.includes('index.html') && webAssets.some((asset) => asset.endsWith('.js')),
    'Incomplete uni-app H5 output',
  );
}

export function validateReleaseManifest(value: unknown): ReleaseArtifactManifest {
  const manifest = record(value, 'release artifact manifest');

  assert.equal(manifest.schemaVersion, 1, 'Unsupported artifact schema');
  assert.equal(manifest.repository, RELEASE_REPOSITORY, 'Unexpected release repository');
  assert.equal(manifest.registry, RELEASE_REGISTRY, 'Unexpected npm registry');
  assertSourceSha(manifest.sourceSha);
  assertRunId(manifest.runId);
  assert.equal(manifest.runAttempt, 1, 'Release artifacts must be prepared on run attempt 1');
  assert(typeof manifest.publishable === 'boolean', 'Missing artifact publication mode');
  assert(manifest.channel === 'stable' || manifest.channel === 'beta', 'Invalid release channel');
  assert.equal(manifest.tag, manifest.channel === 'stable' ? 'latest' : 'beta', 'Invalid tag');

  const tools = record(manifest.tools, 'tool versions');

  for (const key of ['node', 'npm', 'pnpm', 'changesets']) nonempty(tools[key], key);

  const verification = record(manifest.verification, 'artifact verification');

  assert(
    Number.isSafeInteger(verification.nodeEntries) && Number(verification.nodeEntries) >= 0,
    'Invalid Node consumer entry count',
  );
  assert(Array.isArray(verification.browser), 'Missing browser verification');
  assert(Array.isArray(manifest.packages) && manifest.packages.length > 0, 'Empty artifact');

  const names = new Set<string>();
  const paths = new Set<string>();
  let snapshotSuffix: string | undefined;

  for (const item of manifest.packages) {
    const pkg = record(item, 'artifact package');

    assertPackageName(pkg.name);
    assert(!names.has(pkg.name), `Duplicate artifact package: ${pkg.name}`);
    names.add(pkg.name);
    assertVersion(pkg.version);

    if (manifest.channel === 'stable') {
      assert(!semver.prerelease(pkg.version), `Stable artifact contains a prerelease: ${pkg.name}`);
    } else {
      const prerelease = semver.prerelease(pkg.version);
      const suffix = prerelease?.join('.');

      assert.equal(
        suffix,
        betaSuffix(manifest.sourceSha, manifest.runId, String(prerelease?.[1])),
        `Unexpected beta identity: ${pkg.name}`,
      );
      snapshotSuffix ??= suffix;
      assert.equal(suffix, snapshotSuffix, 'Beta packages come from different snapshots');
    }

    const tarball = safeRelativePath(pkg.tarball);

    assert(tarball.startsWith('tarballs/') && tarball.endsWith('.tgz'), 'Invalid tarball path');
    assert(!paths.has(tarball), `Duplicate tarball: ${tarball}`);
    paths.add(tarball);
    assert(typeof pkg.sha256 === 'string' && /^[a-f0-9]{64}$/.test(pkg.sha256), 'Invalid SHA256');
    assert(
      typeof pkg.integrity === 'string' && /^sha512-[A-Za-z0-9+/]{86}==$/.test(pkg.integrity),
      'Invalid tarball integrity',
    );
    assert(
      typeof pkg.contentHash === 'string' && /^[a-f0-9]{64}$/.test(pkg.contentHash),
      'Invalid package content hash',
    );
    assert(Array.isArray(pkg.files) && pkg.files.length > 0, 'Missing archive file list');

    const files: string[] = pkg.files.map(safeRelativePath);

    assert.equal(new Set(files).size, files.length, 'Duplicate archive files');
    assert(files.includes('package.json'), 'Archive has no package.json');
    assert.deepEqual(files, files.toSorted(), 'Archive file list is not sorted');
  }

  const lynxPackages = [...names].filter(
    (name) => name === '@fluxdown/lynx' || name === '@fluxdown/lynx-plugins',
  );

  if (verification.lynx !== undefined) validateLynxVerification(verification.lynx, lynxPackages);

  const taroPackages = [...names].filter(
    (name) => name === '@fluxdown/taro' || name === '@fluxdown/taro-plugins',
  );

  const browserChecks = verification.browser;

  const taroVerified =
    taroPackages.length > 0 &&
    taroPackages.every((name) =>
      ['import', 'require'].every((format) =>
        browserChecks.some((item) => {
          const check = record(item, 'Taro browser verification');

          return (
            check.format === format &&
            typeof check.specifier === 'string' &&
            (check.specifier === name || check.specifier.startsWith(`${name}/`)) &&
            Number(check.selectors) > 0 &&
            Number(check.cssBytes) > 0 &&
            Array.isArray(check.cssAssets) &&
            check.cssAssets.length > 0
          );
        }),
      ),
    );

  assert(!taroPackages.length || taroVerified, 'Missing Taro browser verification');

  const sveltePackages = [...names].filter(
    (name) => name === '@fluxdown/svelte' || name === '@fluxdown/svelte-plugins',
  );

  if (sveltePackages.length || verification.svelte !== undefined) {
    validateSvelteVerification(verification.svelte, sveltePackages);
  }

  const angularPackages = [...names].filter(
    (name) => name === '@fluxdown/angular' || name === '@fluxdown/angular-plugins',
  );

  if (angularPackages.length || verification.angular !== undefined) {
    validateAngularVerification(verification.angular, angularPackages);
  }

  const nativePackages = [...names].filter(
    (name) => name === '@fluxdown/react-native' || name === '@fluxdown/react-native-plugins',
  );

  if (verification.native !== undefined) {
    validateReactNativeVerification(verification.native, nativePackages);
  }

  const uniAppPackages = [...names].filter(
    (name) => name === '@fluxdown/uni-app' || name === '@fluxdown/uni-app-plugins',
  );

  if (uniAppPackages.length || verification.uniApp !== undefined) {
    validateUniAppVerification(verification.uniApp, uniAppPackages);
  }

  const verifiedPackageCount =
    (verification.lynx === undefined ? 0 : lynxPackages.length) +
    (taroVerified ? taroPackages.length : 0) +
    sveltePackages.length +
    angularPackages.length +
    uniAppPackages.length +
    (verification.native === undefined ? 0 : nativePackages.length);

  // Existing Node-verified artifacts remain valid for recovery.
  assert(
    Number(verification.nodeEntries) > 0 || verifiedPackageCount === names.size,
    'Missing consumer verification',
  );

  if (manifest.channel === 'beta') {
    assert.deepEqual(
      [...names].toSorted(),
      [...PUBLIC_PACKAGES].toSorted(),
      'Beta must include every public package',
    );
    assert(manifest.candidate === undefined, 'Beta cannot contain a stable candidate');
  } else if (manifest.publishable) {
    const candidate = validateStableCandidate(manifest.candidate);
    const versions = new Map(candidate.packages.map((pkg) => [pkg.name, pkg.version]));

    assert.equal(versions.size, names.size, 'Stable artifact differs from candidate package set');

    for (const pkg of manifest.packages as ArtifactPackage[]) {
      assert.equal(
        versions.get(pkg.name),
        pkg.version,
        'Stable artifact differs from candidate versions',
      );
    }
  }

  return manifest as unknown as ReleaseArtifactManifest;
}

export function assertPublishEnvironment(
  manifest: ReleaseArtifactManifest,
  env: NodeJS.ProcessEnv,
): void {
  assert(manifest.publishable, 'Dry-run artifacts cannot be published');
  assert.equal(env.GITHUB_ACTIONS, 'true', 'Publication is restricted to GitHub Actions');
  assert.equal(env.GITHUB_REF, 'refs/heads/main', 'Publication workflow must run from main');
  assert.equal(
    env.GITHUB_RUN_ATTEMPT,
    '1',
    'Use a new recovery dispatch instead of rerunning a publication job',
  );
  assert.equal(env.GITHUB_REPOSITORY, RELEASE_REPOSITORY, 'Unexpected workflow repository');
  assert.equal(
    env.EXPECTED_RELEASE_REPOSITORY,
    manifest.repository,
    'Artifact repository mismatch',
  );
  assert.equal(env.EXPECTED_RELEASE_SOURCE_SHA, manifest.sourceSha, 'Artifact source SHA mismatch');
  assert.equal(env.EXPECTED_RELEASE_CHANNEL, manifest.channel, 'Artifact channel mismatch');
  assert.equal(env.EXPECTED_RELEASE_RUN_ID, manifest.runId, 'Artifact preparation run mismatch');
  assert.equal(
    env.EXPECTED_RELEASE_RUN_ATTEMPT,
    String(manifest.runAttempt),
    'Artifact preparation attempt mismatch',
  );
}

export function tarballDigests(data: Uint8Array): { sha256: string; integrity: string } {
  return {
    sha256: createHash('sha256').update(data).digest('hex'),
    integrity: `sha512-${createHash('sha512').update(data).digest('base64')}`,
  };
}

export async function readArtifactFile(root: string, relative: string): Promise<Buffer> {
  safeRelativePath(relative);

  const rootInfo = await lstat(root);

  assert(
    rootInfo.isDirectory() && !rootInfo.isSymbolicLink(),
    'Artifact root must be a real directory',
  );

  let current = root;
  const parts = relative.split('/');

  for (const [index, part] of parts.entries()) {
    current = path.join(current, part);

    const info = await lstat(current);

    assert(!info.isSymbolicLink(), `Artifact contains a symlink: ${relative}`);
    assert(
      index === parts.length - 1 ? info.isFile() : info.isDirectory(),
      `Invalid artifact file: ${relative}`,
    );
    assert(info.size <= 64 * 1024 * 1024, `Artifact file exceeds size limit: ${relative}`);
  }

  return readFile(current);
}

export function publicationDisposition(
  artifact: Pick<ArtifactPackage, 'name' | 'version' | 'integrity'>,
  publishedIntegrity: string | null,
): 'publish' | 'skip' {
  if (publishedIntegrity === null) return 'publish';

  assert.equal(
    publishedIntegrity,
    artifact.integrity,
    `${artifact.name}@${artifact.version}: npm already contains a different tarball`,
  );

  return 'skip';
}

export function parseRegistryResponse(
  result: { status: number | null; error?: Error; stdout: string; stderr: string },
  specifier: string,
): unknown | null {
  let value: unknown;

  try {
    value = JSON.parse(result.stdout);
  } catch {
    throw new Error(
      `Invalid registry response for ${specifier}: ${result.error?.message ?? result.stderr}`,
    );
  }

  if (result.status === 0 && !result.error) {
    assert(value !== null, `Invalid empty registry response for ${specifier}`);

    return value;
  }

  if (!result.error && value && typeof value === 'object' && 'error' in value) {
    const error = value.error;

    if (error && typeof error === 'object' && 'code' in error && error.code === 'E404') return null;
  }

  throw new Error(
    `Cannot verify npm registry state for ${specifier}: ${result.error?.message ?? result.stderr}`,
  );
}

function baseVersion(value: string): string {
  const parsed = semver.parse(value)!;

  return `${parsed.major}.${parsed.minor}.${parsed.patch}`;
}

export function assertTagDoesNotRegress(
  channel: ReleaseChannel,
  version: string,
  currentTagVersion: string | null,
  runId: string,
): void {
  if (currentTagVersion === null || currentTagVersion === version) return;

  assertVersion(currentTagVersion);

  if (channel === 'stable') {
    assert(
      semver.gt(version, currentTagVersion),
      `Refusing to move latest backwards from ${currentTagVersion} to ${version}`,
    );

    return;
  }

  const current = semver.prerelease(currentTagVersion);
  const run = current?.[3];

  assert(
    current?.length === 5 &&
      current[0] === 'beta' &&
      /^\d{14}$/.test(String(current[1])) &&
      typeof current[2] === 'string' &&
      /^g[a-f0-9]{40}$/.test(current[2]) &&
      current[4] === 'a1' &&
      typeof run === 'string' &&
      /^r[1-9]\d*$/.test(run),
    `Existing beta tag ${currentTagVersion} is not a recognized release; reconcile it before publishing`,
  );
  assert(
    BigInt(run.slice(1)) < BigInt(runId),
    `Refusing to replace a newer beta run: ${currentTagVersion}`,
  );

  assert(
    semver.gte(baseVersion(version), baseVersion(currentTagVersion)),
    `Refusing to move beta to an older base version: ${version}`,
  );
}

interface TarFile {
  path: string;
  data: Buffer;
}

function tarString(bytes: Buffer): string {
  const end = bytes.indexOf(0);

  return bytes.subarray(0, end < 0 ? undefined : end).toString('utf8');
}

function tarNumber(bytes: Buffer): number {
  const text = tarString(bytes).trim();

  assert(/^[0-7]*$/.test(text), 'Unsupported tar numeric field');

  const value = text === '' ? 0 : Number.parseInt(text, 8);

  assert(Number.isSafeInteger(value) && value >= 0, 'Invalid tar size');

  return value;
}

function paxFields(data: Buffer): Record<string, string> {
  const result: Record<string, string> = {};
  let offset = 0;

  while (offset < data.length) {
    const space = data.indexOf(32, offset);

    assert(space > offset, 'Invalid PAX record');

    const sizeText = data.subarray(offset, space).toString();

    assert(/^[1-9]\d*$/.test(sizeText), 'Invalid PAX length');

    const length = Number(sizeText);

    assert(
      Number.isSafeInteger(length) && length > space - offset + 1 && offset + length <= data.length,
      'Invalid PAX length',
    );
    assert.equal(data[offset + length - 1], 10, 'Invalid PAX terminator');

    const text = data.subarray(space + 1, offset + length - 1).toString('utf8');
    const equal = text.indexOf('=');

    assert(equal > 0, 'Invalid PAX field');
    result[text.slice(0, equal)] = text.slice(equal + 1);
    offset += length;
  }

  return result;
}

// Validate the entire archive before writing any entry. Neither symlinks nor
// hardlinks/devices are accepted, including links hidden behind a PAX header.
export function parsePackageTarball(compressed: Buffer): TarFile[] {
  assert(compressed.length <= 64 * 1024 * 1024, 'Tarball exceeds compressed size limit');

  const archive = gunzipSync(compressed, { maxOutputLength: 256 * 1024 * 1024 });
  const files: TarFile[] = [];
  const seen = new Map<string, 'file' | 'directory'>();
  let pax: Record<string, string> = {};
  let offset = 0;

  while (offset + 512 <= archive.length) {
    const header = archive.subarray(offset, offset + 512);

    if (header.every((byte) => byte === 0)) {
      assert(
        archive.subarray(offset).every((byte) => byte === 0),
        'Unexpected data after tar terminator',
      );
      offset = archive.length;
      break;
    }

    const expectedChecksum = tarNumber(header.subarray(148, 156));
    const checksum = header.reduce(
      (sum, byte, index) => sum + (index >= 148 && index < 156 ? 32 : byte),
      0,
    );

    assert.equal(checksum, expectedChecksum, 'Invalid tar checksum');

    const size = tarNumber(header.subarray(124, 136));
    const data = archive.subarray(offset + 512, offset + 512 + size);

    assert.equal(data.length, size, 'Truncated tar entry');
    offset += 512 + Math.ceil(size / 512) * 512;
    assert(offset <= archive.length, 'Truncated tar padding');

    const type = tarString(header.subarray(156, 157));

    if (type === 'x') {
      assert.equal(Object.keys(pax).length, 0, 'Consecutive PAX headers are not supported');
      pax = paxFields(data);
      assert(!('linkpath' in pax), 'Archive contains a PAX link');
      continue;
    }

    assert(type === '' || type === '0' || type === '5', `Unsupported archive entry type: ${type}`);

    const prefix = tarString(header.subarray(345, 500));
    const headerName = [prefix, tarString(header.subarray(0, 100))].filter(Boolean).join('/');
    const name = pax.path ?? headerName;

    if (pax.size !== undefined)
      assert.equal(pax.size, String(size), 'PAX size differs from tar header');
    pax = {};

    const normalized = type === '5' && name.endsWith('/') ? name.slice(0, -1) : name;

    safeRelativePath(normalized);
    assert(
      normalized === 'package' || normalized.startsWith('package/'),
      'Archive entry outside package/',
    );
    assert(type === '5' || normalized !== 'package', 'Invalid package root');
    assert(!seen.has(normalized), `Duplicate archive entry: ${normalized}`);

    for (
      let ancestor = path.posix.dirname(normalized);
      ancestor !== '.';
      ancestor = path.posix.dirname(ancestor)
    ) {
      assert(seen.get(ancestor) !== 'file', `Archive file used as directory: ${ancestor}`);
    }

    if (type !== '5') {
      assert(
        ![...seen.keys()].some((entry) => entry.startsWith(`${normalized}/`)),
        'Archive directory replaced by file',
      );
      files.push({ path: normalized.slice('package/'.length), data });
    } else {
      assert.equal(size, 0, 'Archive directory has contents');
    }

    seen.set(normalized, type === '5' ? 'directory' : 'file');
    assert(seen.size <= 50_000, 'Archive contains too many entries');
  }

  assert.equal(offset, archive.length, 'Truncated tar archive');
  assert.equal(Object.keys(pax).length, 0, 'Unconsumed PAX header');
  assert(
    files.some((file) => file.path === 'package.json'),
    'Archive contains no package.json',
  );

  return files.toSorted((a, b) => a.path.localeCompare(b.path, 'en'));
}

export async function extractPackageTarball(
  compressed: Buffer,
  destination: string,
): Promise<void> {
  const files = parsePackageTarball(compressed);

  await mkdir(destination, { recursive: true });

  for (const file of files) {
    const target = path.join(destination, file.path);

    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, file.data, { flag: 'wx' });
  }
}
