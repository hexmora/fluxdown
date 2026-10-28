import { act, cleanup, render, waitFor } from '@testing-library/react';

import { Fluxdown } from '../packs/full';

afterEach(cleanup);

test('updates MathJax image colors with the theme and container styles', async () => {
  const text = String.raw`Before $\bbox[5px]{x}$ after.`;

  const { container, rerender } = render(<Fluxdown build={{ tex: true }} text={text} />);

  await waitFor(() => expect(container.querySelector('taro-image-core')).not.toBeNull(), {
    timeout: 20000,
  });

  const source = () => {
    return decodeURIComponent(container.querySelector('taro-image-core')!.getAttribute('src')!);
  };

  expect(source()).toContain('#202123');

  await act(async () => {
    rerender(<Fluxdown build={{ tex: true }} text={text} theme="dark" />);
  });

  expect(source()).toContain('#ececf1');

  rerender(<Fluxdown build={{ tex: true }} style={{ color: '#123456' }} text={text} />);

  expect(source()).toContain('#123456');

  rerender(<Fluxdown build={{ tex: true }} style="color: #abcdef" text={text} />);

  expect(source()).toContain('#abcdef');

  expect(container).toHaveTextContent('Before');

  expect(container).toHaveTextContent('after.');
}, 30000);

test('passes custom quote and link colors to nested MathJax formulas', async () => {
  const { container } = render(
    <Fluxdown
      build={{ tex: true }}
      text={String.raw`> $\bbox[5px]{x}$

[$\bbox[5px]{y}$](https://example.com)`}
      theme={{ tokens: { colors: { fgMuted: '#554433', accent: '#116655' } } }}
    />,
  );

  await waitFor(() => expect(container.querySelectorAll('taro-image-core')).toHaveLength(2));

  const quote = container.querySelector('[data-tag="blockquote"] taro-image-core')!;

  const link = container.querySelector('taro-navigator-core taro-image-core')!;

  expect(decodeURIComponent(quote.getAttribute('src')!)).toContain('#554433');

  expect(decodeURIComponent(link.getAttribute('src')!)).toContain('#116655');
});
