import {
  BaseSmoothDriver,
  BaseSmoothInterpolator,
  IntervalSmoothDriver,
  RafSmoothDriver,
  Smooth,
  SpringSmoothInterpolator,
} from '@fluxdown/core-presets/mapper';

import { BaseRenderer, BaseRenderPlugin } from '..';

describe('core public exports', () => {
  test('exposes renderer modules and smooth streaming declarations', () => {
    for (const declaration of [
      BaseRenderer,
      BaseRenderPlugin,
      BaseSmoothInterpolator,
      BaseSmoothDriver,
      IntervalSmoothDriver,
      RafSmoothDriver,
      Smooth,
      SpringSmoothInterpolator,
    ]) {
      expect(typeof declaration).toBe('function');
    }
  });
});
