import {
  IntervalSmoothDriver,
  RafSmoothDriver,
  SpringSmoothInterpolator,
} from '@fluxdown/core-plugins/plugins/mapper/smooth';
import { afterEach, expect, test, vi } from 'vitest';

import { toBuildConfig, toSmoothConfig, toStreamingConfig } from '../config';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('resolves disabled, default, and explicit streaming configuration', () => {
  expect(toStreamingConfig()).toEqual({ repairEnding: false, smooth: false, effect: false });

  expect(toStreamingConfig(true)).toEqual({ repairEnding: true, smooth: true, effect: 'scale' });

  expect(toStreamingConfig({})).toEqual({ repairEnding: true, smooth: true, effect: 'scale' });

  expect(toStreamingConfig({ smooth: false, effect: [] })).toEqual({
    repairEnding: true,
    smooth: false,
    effect: [],
  });
});

test('selects RAF when available and falls back to interval outside the browser', () => {
  vi.stubGlobal('requestAnimationFrame', vi.fn());

  vi.stubGlobal('cancelAnimationFrame', vi.fn());

  expect(toSmoothConfig(true)).toEqual({
    enabled: true,
    driver: RafSmoothDriver,
    interpolation: SpringSmoothInterpolator,
  });

  vi.stubGlobal('requestAnimationFrame', undefined);

  vi.stubGlobal('cancelAnimationFrame', undefined);

  expect(toSmoothConfig(true)).toEqual({
    enabled: true,
    driver: IntervalSmoothDriver,
    interpolation: SpringSmoothInterpolator,
  });
});

test('accepts explicit driver and interpolation classes and rejects unknown names', () => {
  expect(
    toSmoothConfig({
      driver: IntervalSmoothDriver,
      interpolation: SpringSmoothInterpolator,
    }),
  ).toEqual({
    enabled: false,
    driver: IntervalSmoothDriver,
    interpolation: SpringSmoothInterpolator,
  });

  expect(() => toSmoothConfig({ driver: 'missing' as 'raf', interpolation: 'spring' })).toThrow(
    'Unknown driver type',
  );

  expect(() => toSmoothConfig({ driver: 'raf', interpolation: 'missing' as 'spring' })).toThrow(
    'Unknown interpolation type',
  );
});

test('accepts the deprecated ticker and scheduler names when the new ones are absent', () => {
  expect(toSmoothConfig({ ticker: 'interval', scheduler: 'spring' })).toEqual({
    enabled: false,
    driver: IntervalSmoothDriver,
    interpolation: SpringSmoothInterpolator,
  });

  expect(toSmoothConfig({ driver: 'raf', ticker: 'interval' }).driver).toBe(RafSmoothDriver);
});

test('applies ending repair independently and leaves caller build options unchanged', () => {
  const base = { tex: true, repair: false };

  const config = toBuildConfig({ base, repairEnding: true, idPrefix: 'instance' });

  expect(config).toMatchObject({
    tex: true,
    repair: false,
    repairEnding: true,
    idPrefix: 'instance',
  });

  expect(base).toEqual({ tex: true, repair: false });

  expect(toBuildConfig({ base: {}, repairEnding: false }).tex).toBe(false);
});
