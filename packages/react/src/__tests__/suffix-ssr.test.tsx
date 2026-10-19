/** @jest-environment node */

import { renderToStaticMarkup } from 'react-dom/server';

import { Fluxdown } from '../packs/full';

test('renders suffix server markup with full code content and no timers', () => {
  jest.useFakeTimers();
  try {
    const markup = renderToStaticMarkup(
      <Fluxdown
        streaming={{ effect: ['suffix', { type: 'dot' }] }}
        text={'```text\nserver\n```'}
      />,
    );
    expect(markup).toContain('data-fluxdown-suffix="dot"');
    expect(markup).toContain('server');
    expect(jest.getTimerCount()).toBe(0);
  } finally {
    jest.useRealTimers();
  }
});
