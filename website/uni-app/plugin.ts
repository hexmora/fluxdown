import type { RspressPlugin } from '@rspress/core';

import { execFile } from 'node:child_process';
import { cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execute = /*#__PURE__*/ promisify(execFile);

export function uniAppDemo(): RspressPlugin {
  return {
    name: 'uni-app-demo',
    async beforeBuild() {
      const root = fileURLToPath(new URL('../../', import.meta.url));

      const destination = `${root}/website/docs/public/uni-app-demo`;

      await execute('pnpm', ['--filter', '@fluxdown/uni-app-playground', 'build'], {
        cwd: root,
        maxBuffer: 16 * 1024 * 1024,
      });

      await rm(destination, { recursive: true, force: true });

      await cp(`${root}/packages/uni-app/playground/dist/build/h5`, destination, {
        recursive: true,
      });
    },
  };
}
