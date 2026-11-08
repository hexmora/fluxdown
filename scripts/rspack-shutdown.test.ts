import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

const website = createRequire(new URL('../website/package.json', import.meta.url));

const compilers = [
  ...new Set(
    ['@rspress/core', '@lynx-js/rspeedy'].map((dependency) => {
      const toolkit = createRequire(website.resolve(`${dependency}/package.json`));
      const builder = createRequire(toolkit.resolve('@rsbuild/core/package.json'));

      return builder.resolve('@rspack/core');
    }),
  ),
];

for (const exitCode of [0, 1]) {
  test(`website compilers exit with code ${exitCode} without native reference warnings`, (t) => {
    const directory = mkdtempSync(path.join(tmpdir(), 'fluxdown-rspack-shutdown-'));
    t.after(() => rmSync(directory, { recursive: true, force: true }));

    const fixture = path.join(directory, 'shutdown.mjs');

    writeFileSync(
      fixture,
      `import assert from 'node:assert/strict';
import { writeSync } from 'node:fs';
import { createRequire } from 'node:module';
import { promisify } from 'node:util';

const { rspack } = createRequire(import.meta.url)(process.argv[2]);
const entry = 'data:text/javascript,export default 42';
const compiler = rspack({
  mode: 'none',
  entry,
  output: { path: import.meta.dirname },
});
let accessed = false;

// Exercise the native accessor caches used by documentation and Lynx plugins.
// Regression: https://github.com/web-infra-dev/rspack/pull/16117
compiler.hooks.compilation.tap('ShutdownTest', (compilation) => {
  compilation.hooks.finishModules.tap('ShutdownTest', (modules) => {
    const module = [...modules].find((item) => item.resource === entry);
    assert(module);
    assert.equal(typeof Object.getOwnPropertyDescriptor(module, 'context').get, 'function');
    assert.equal(module.matchResource, undefined);
    assert(Array.isArray(module.buildInfo[Symbol.for('rspack.buildInfo.fileDependencies')]));
    accessed = true;
  });
});

try {
  const stats = await promisify(compiler.run.bind(compiler))();
  assert.equal(stats.hasErrors(), false);
  assert.equal(accessed, true);
} finally {
  await promisify(compiler.close.bind(compiler))();
}

writeSync(1, 'compiler closed\\n');
process.exit(Number(process.argv[3]));
`,
    );

    for (const compiler of compilers) {
      const result = spawnSync(process.execPath, [fixture, compiler, String(exitCode)], {
        cwd: directory,
        encoding: 'utf8',
        timeout: 30_000,
      });

      assert.ifError(result.error);
      assert.equal(result.signal, null, result.stderr);
      assert.equal(result.status, exitCode, result.stderr);
      assert.match(result.stdout, /compiler closed/);
      assert.doesNotMatch(result.stderr, /ObjectRef is not unref/);
    }
  });
}
