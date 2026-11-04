import { expect, test } from '@rstest/core';
import { execFileSync } from 'node:child_process';

test.each([false, true])(
  'initializes the background runtime with missing built-ins: %s',
  (missing) => {
    // The test runner itself calls Object.hasOwn; isolate the older host in a fresh process.
    const output = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `
        import assert from 'node:assert/strict';
        const originalAt = Array.prototype.at;
        const originalHasOwn = Object.hasOwn;

        if (${missing}) {
          Reflect.deleteProperty(Array.prototype, 'at');
          Reflect.deleteProperty(Object, 'hasOwn');
        }

        const { ensureRuntime } = await import('./src/modules/runtime/index.ts');
        const builtins = ensureRuntime();

        assert.equal(typeof builtins.at, 'function');
        assert.equal(typeof builtins.hasOwn, 'function');
        assert.equal([1, 2].at(-1), 2);
        assert.equal([1, 2].at(2), undefined);
        assert.equal(Object.hasOwn({ own: true }, 'own'), true);
        assert.equal(Object.hasOwn(Object.create({ inherited: true }), 'inherited'), false);

        if (!${missing}) {
          assert.equal(Array.prototype.at, originalAt);
          assert.equal(Object.hasOwn, originalHasOwn);
        }

        const { Marked } = await import('../core/node_modules/marked/lib/marked.esm.js');
        const lexer = new Marked({ gfm: true });
        const tokens = lexer.lexer('# Native\\n\\nHello **Lynx**.\\n\\n- First\\n- Second\\n\\n> Quote\\n\\n| A | B |\\n| - | - |\\n| 1 | 2 |');

        assert.deepEqual(tokens.filter(token => token.type !== 'space').map(token => token.type), [
          'heading', 'paragraph', 'list', 'blockquote', 'table',
        ]);
        assert.equal(tokens.find(token => token.type === 'list').items.length, 2);
        assert.equal(tokens.find(token => token.type === 'table').rows.length, 1);
        console.log('runtime and parser ready');
      `,
      ],
      { cwd: process.cwd(), encoding: 'utf8' },
    );

    expect(output.trim()).toBe('runtime and parser ready');
  },
);
