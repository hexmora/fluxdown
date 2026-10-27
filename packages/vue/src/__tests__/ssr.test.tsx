// @vitest-environment node

import { renderToString } from '@vue/server-renderer';
import { createSSRApp, h } from 'vue';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';

describe('server rendering', () => {
  test.each([Fluxdown, FluxdownLite])(
    'renders complete Markdown without starting timers',
    async (Component) => {
      const interval = vi.spyOn(globalThis, 'setInterval');

      const app = createSSRApp(() => {
        return h(Component, {
          text: '# Server heading\n\n**complete** content',
          streaming: { smooth: true, effect: 'scale' },
        });
      });

      const markup = (await renderToString(app)).replace(/<!--[\s\S]*?-->/g, '');

      expect(markup).toMatch(/<h1\b[^>]*>Server heading<\/h1>/);

      expect(markup).toMatch(/<strong\b[^>]*>complete<\/strong>/);

      expect(interval).not.toHaveBeenCalled();
    },
  );

  test('does not animate initial chunk content on the server', async () => {
    const markup = await renderToString(
      createSSRApp(() => {
        return <FluxdownLite text="Initial text" streaming={{ smooth: false, effect: 'chunk' }} />;
      }),
    );

    expect(markup).toContain('Initial text');

    expect(markup).not.toContain('data-fluxdown-chunk');
  });
});
