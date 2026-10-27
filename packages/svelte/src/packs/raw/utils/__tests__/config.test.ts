import {
  IntervalSmoothTicker,
  RafSmoothTicker,
  SpringSmoothScheduler,
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
    ticker: RafSmoothTicker,
    scheduler: SpringSmoothScheduler,
  });

  vi.stubGlobal('requestAnimationFrame', undefined);

  vi.stubGlobal('cancelAnimationFrame', undefined);

  expect(toSmoothConfig(true)).toEqual({
    enabled: true,
    ticker: IntervalSmoothTicker,
    scheduler: SpringSmoothScheduler,
  });
});

test('accepts explicit ticker and scheduler classes and rejects unknown names', () => {
  expect(
    toSmoothConfig({
      ticker: IntervalSmoothTicker,
      scheduler: SpringSmoothScheduler,
    }),
  ).toEqual({ enabled: false, ticker: IntervalSmoothTicker, scheduler: SpringSmoothScheduler });

  expect(() => toSmoothConfig({ ticker: 'missing' as 'raf', scheduler: 'spring' })).toThrow(
    'Unknown ticker type',
  );

  expect(() => toSmoothConfig({ ticker: 'raf', scheduler: 'missing' as 'spring' })).toThrow(
    'Unknown scheduler type',
  );
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
