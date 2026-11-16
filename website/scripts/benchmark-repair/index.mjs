import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildAdapters } from './build.mjs';
import { dom } from './environment.mjs';
import { runBenchmark } from './run.mjs';

const website = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const workspace = resolve(website, '..');
const output = resolve(website, 'benchmark/repair.json');
const temporaryOutput = `${output}.${process.pid}.tmp`;
const temporary = await mkdtemp(join(tmpdir(), 'fluxdown-repair-'));
const startedAt = performance.now();

const hash = (value) => {
  return createHash('sha256').update(value).digest('hex');
};

const installedVersion = (name) => {
  let directory = dirname(fileURLToPath(import.meta.resolve(name)));

  while (directory !== dirname(directory)) {
    const file = join(directory, 'package.json');

    if (existsSync(file)) {
      const manifest = JSON.parse(readFileSync(file, 'utf8'));

      if (manifest.name === name) {
        return manifest.version;
      }
    }

    directory = dirname(directory);
  }

  throw new Error(`Cannot resolve installed version: ${name}`);
};

const readInputs = async () => {
  const [manifest, lockfile] = await Promise.all([
    readFile(resolve(workspace, 'packages/react/package.json'), 'utf8'),
    readFile(resolve(workspace, 'pnpm-lock.yaml')),
  ]);

  return { version: JSON.parse(manifest).version, lockfileSha256: hash(lockfile) };
};

try {
  const inputs = await readInputs();
  const versions = Object.fromEntries(
    [
      'streamdown',
      '@ant-design/x-markdown',
      'react-markdown',
      'remark-gfm',
      'markdown-it',
      'markdown-it-task-lists',
      'marked',
      'react',
      'react-dom',
      'jsdom',
    ].map((name) => [name, installedVersion(name)]),
  );
  const manifest = await buildAdapters({
    workspace,
    output: join(temporary, 'adapters.cjs'),
    fluxdownVersion: inputs.version,
    versions,
  });

  process.stdout.write(`Benchmarking fluxdown@${inputs.version} from the current workspace\n`);

  const report = await runBenchmark(manifest);
  const latest = await readInputs();
  const changed = await Promise.all(
    Object.entries(manifest.files).map(
      async ([file, fingerprint]) => hash(await readFile(resolve(workspace, file))) !== fingerprint,
    ),
  );

  if (
    latest.version !== inputs.version ||
    latest.lockfileSha256 !== inputs.lockfileSha256 ||
    changed.some(Boolean)
  ) {
    throw new Error(
      'Benchmark inputs changed during measurement; existing snapshot was preserved.',
    );
  }

  const snapshot = {
    meta: {
      generatedAt: report.meta.generatedAt,
      date: report.meta.date,
      cases: report.meta.cases,
      framesPerLibrary: report.meta.framesPerLibrary,
      categories: report.meta.categories,
      corpusSha256: report.meta.corpusSha256,
      fluxdownCommit: manifest.commit,
      fluxdownSourceHash: manifest.sourceHash,
      lockfileSha256: inputs.lockfileSha256,
      source: 'workspace release candidate',
      environment: { node: process.version, react: versions.react, jsdom: versions.jsdom },
      method:
        'semantic-roles-v1; settled DOM; Unicode code-point inputs; equal-weight mean of case jump-frame rates; completion frame excluded',
    },
    libraries: report.libraries.map((library) => ({
      id: library.id,
      name: library.name,
      version: library.version,
      source: library.source,
      profile: library.profile,
      metrics: { cases: library.metrics.cases, jumpFrameRate: library.metrics.jumpFrameRate },
      categories: library.categories.map((category) => ({
        category: category.category,
        cases: category.cases,
        jumpFrameRate: category.jumpFrameRate,
      })),
    })),
  };
  const reports = resolve(workspace, '.reports/benchmark-repair');

  await mkdir(reports, { recursive: true });
  await writeFile(join(reports, 'results.json'), JSON.stringify(report, null, 2));
  await writeFile(
    join(reports, 'source-manifest.json'),
    JSON.stringify({ files: manifest.files, sourceHash: manifest.sourceHash }, null, 2),
  );
  await mkdir(dirname(output), { recursive: true });
  await writeFile(temporaryOutput, JSON.stringify(snapshot, null, 2) + '\n', { flag: 'wx' });
  await rename(temporaryOutput, output);

  process.stdout.write(
    `Updated website/benchmark/repair.json (${report.meta.cases} cases, ${((performance.now() - startedAt) / 1000).toFixed(1)}s)\n`,
  );
} finally {
  dom.window.close();
  await rm(temporaryOutput, { force: true });
  await rm(temporary, { recursive: true, force: true });
}
