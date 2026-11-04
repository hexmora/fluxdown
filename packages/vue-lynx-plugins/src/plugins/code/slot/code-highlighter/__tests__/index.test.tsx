import { mount } from '@vue/test-utils';
import { expect, test, vi } from 'vitest';

import { CodeHighlighterRenderer } from '../renderer';

test.each(['web', 'iOS', 'Android'])(
  'preserves code rows on %s without changing the source or native whitespace',
  (platform) => {
    vi.stubGlobal('SystemInfo', { platform });

    try {
      const view = mount(CodeHighlighterRenderer, {
        props: { Raw: null, code: '  first\n    second', suffix: 'tail' },
      });

      const rows = view.findAll('.fluxdown-code-highlighter > view > text');

      expect(rows).toHaveLength(2);

      expect(rows[0].element.textContent).toBe('  first');

      expect(rows[1].element.textContent).toBe('    secondtail');

      expect(view.find('.fluxdown-code-highlighter-web').exists()).toBe(platform === 'web');

      for (const row of rows) {
        expect(row.attributes('style')).toContain('white-space: nowrap');
      }
    } finally {
      vi.unstubAllGlobals();
    }
  },
);
