import { renderToString } from 'solid-js/web';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';

describe('server rendering', () => {
  test('escapes Markdown text nodes in server markup', () => {
    const markup = renderToString(() => (
      <FluxdownLite text={'&lt;img src=x onerror=alert(1)&gt; &amp; 2 > 1'} />
    ));

    expect(markup).toContain('&lt;img src=x onerror=alert(1)> &amp; 2 > 1');

    expect(markup).not.toContain('<img');
  });

  test.each([Fluxdown, FluxdownLite])(
    'renders complete Markdown without starting timers',
    (Component) => {
      const interval = vi.spyOn(globalThis, 'setInterval');

      const markup = renderToString(() => (
        <Component
          text={'# Server heading\n\n**complete** content'}
          streaming={{ smooth: true, effect: 'scale' }}
        />
      )).replace(/<!--[\s\S]*?-->/g, '');

      expect(markup).toMatch(/<h1\b[^>]*>Server heading<\/h1>/);

      expect(markup).toMatch(/<strong\b[^>]*>complete<\/strong>/);

      expect(interval).not.toHaveBeenCalled();
    },
  );

  test('does not animate initial chunk content on the server', () => {
    const markup = renderToString(() => (
      <FluxdownLite text="Initial text" streaming={{ smooth: false, effect: 'chunk' }} />
    ));

    expect(markup).toContain('Initial text');

    expect(markup).not.toContain('data-fluxdown-chunk');
  });
});
