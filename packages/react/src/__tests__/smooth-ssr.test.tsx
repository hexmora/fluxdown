/** @jest-environment node */

import { renderToStaticMarkup } from 'react-dom/server';

import { restoreGlobals, stubGlobal } from '../../../../scripts/testing/globals';
import { Fluxdown } from '../packs/full';

describe('Fluxdown smooth server rendering', () => {
  test('renders full server markup with smoothing enabled and starts no timers', () => {
    const request = jest.fn();

    const interval = jest.fn();

    expect(typeof document).toBe('undefined');

    stubGlobal('requestAnimationFrame', request);

    stubGlobal('cancelAnimationFrame', jest.fn());

    stubGlobal('setInterval', interval);

    try {
      const markup = renderToStaticMarkup(
        <Fluxdown streaming={{ smooth: true, effect: false }} text="# Smooth server heading" />,
      );

      expect(markup).toMatch(/<h1\b[^>]*>Smooth server heading<\/h1>/);

      expect(request).not.toHaveBeenCalled();

      expect(interval).not.toHaveBeenCalled();
    } finally {
      restoreGlobals();
    }
  });
});
