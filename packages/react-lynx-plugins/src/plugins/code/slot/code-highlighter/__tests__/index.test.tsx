import { cleanup, render } from '@lynx-js/react/testing-library';
import { afterEach, expect, test } from '@rstest/core';

import { CodeHighlighterRenderer } from '../renderer';

afterEach(cleanup);

test.each(['web', 'iOS', 'Android'])(
  'preserves code rows on %s without changing the source or native whitespace',
  (platform) => {
    const runtimes = [
      globalThis.lynxTestingEnv.mainThread,
      globalThis.lynxTestingEnv.backgroundThread,
    ];

    const original = runtimes.map((runtime) => runtime['SystemInfo']);

    for (const runtime of runtimes) runtime['SystemInfo'] = { platform };

    try {
      const view = render(
        <CodeHighlighterRenderer
          Raw={null}
          code={'  first\n    second'}
          suffix={<text>tail</text>}
        />,
      );

      const rows = view.container.querySelectorAll('.fluxdown-code-highlighter > view > text');

      expect(rows).toHaveLength(2);

      expect(rows[0].textContent).toBe('  first');

      expect(rows[1].textContent).toBe('    secondtail');

      expect(view.container.querySelector('.fluxdown-code-highlighter-web') !== null).toBe(
        platform === 'web',
      );

      for (const row of rows) {
        expect(row.getAttribute('style')).toContain('white-space: nowrap');
      }
    } finally {
      runtimes.forEach((runtime, index) => {
        runtime['SystemInfo'] = original[index];
      });
    }
  },
);
