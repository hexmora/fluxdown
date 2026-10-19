/** @jest-environment node */

import { renderToStaticMarkup } from 'react-dom/server';

import { Fluxdown } from '..';

test('renders full server content without chunk wrappers or animation timers', () => {
  jest.useFakeTimers();

  try {
    const markup = renderToStaticMarkup(
      <Fluxdown streaming={{ effect: 'chunk' }} text="Server **content** 👋" />,
    );

    expect(markup).toContain('Server <strong');
    expect(markup).toContain('content</strong> 👋');
    expect(markup).not.toContain('data-fluxdown-chunk');
    expect(jest.getTimerCount()).toBe(0);
  } finally {
    jest.useRealTimers();
  }
});
