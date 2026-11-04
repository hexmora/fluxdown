import type {
  BaseSmoothConfig,
  SchedulerParams,
  SchedulerType,
  SmoothSchedulerClass,
  SmoothTickerClass,
  TickerParams,
  TickerType,
} from '@fluxdown/core-plugins/plugins/mapper/smooth';

import {
  IntervalSmoothTicker,
  RafSmoothTicker,
  SpringSmoothScheduler,
} from '@fluxdown/core-plugins/plugins/mapper/smooth';
import { isEnableRAF } from '@fluxdown/utils';
import { afterEach, describe, expect, rstest, test } from '@rstest/core';
import { expectTypeOf } from 'expect-type';

import { getSchedulerByType, getTickerByType, toSmoothConfig, toStreamingConfig } from '..';
import { restoreGlobals, stubGlobal } from '../../../../../../../scripts/testing/globals';
import { ALL_SCHEDULERS, ALL_TICKERS } from '../../../../consts';

afterEach(() => {
  restoreGlobals();
});

describe('smooth configuration', () => {
  test('defaults enabled streaming to scale and retains explicit effect overrides', () => {
    expect(toStreamingConfig()).toEqual({ repairEnding: false, smooth: false, effect: false });
    expect(toStreamingConfig(false)).toEqual(toStreamingConfig());
    expect(toStreamingConfig(true)).toEqual({ repairEnding: true, smooth: true, effect: 'scale' });
    expect(toStreamingConfig({})).toEqual(toStreamingConfig(true));
    expect(toStreamingConfig({ smooth: false }).effect).toBe('scale');
    expect(toStreamingConfig({ effect: false }).effect).toBe(false);
    expect(toStreamingConfig({ effect: 'shad' }).effect).toBe('shad');
  });

  test('exports runtime registries and their public constructor types', () => {
    expect(ALL_TICKERS).toEqual([RafSmoothTicker, IntervalSmoothTicker]);

    expect(ALL_SCHEDULERS).toEqual([SpringSmoothScheduler]);

    expectTypeOf<TickerType>().toEqualTypeOf<'raf' | 'interval'>();

    expectTypeOf<SchedulerType>().toEqualTypeOf<'spring'>();

    expectTypeOf<TickerParams>().toEqualTypeOf<[interval?: number]>();

    expectTypeOf<SchedulerParams>().toEqualTypeOf<[tuple?: number[]]>();

    expectTypeOf<typeof RafSmoothTicker>().toMatchTypeOf<SmoothTickerClass>();

    expectTypeOf<typeof SpringSmoothScheduler>().toMatchTypeOf<SmoothSchedulerClass>();
  });

  test('resolves exact runtime names and preserves custom constructors', () => {
    expect(getTickerByType('raf')).toBe(RafSmoothTicker);

    expect(getTickerByType('interval')).toBe(IntervalSmoothTicker);

    expect(getSchedulerByType('spring')).toBe(SpringSmoothScheduler);

    class CustomTicker extends RafSmoothTicker {}

    class CustomScheduler extends SpringSmoothScheduler {}

    expect(getTickerByType(CustomTicker)).toBe(CustomTicker);

    expect(getSchedulerByType(CustomScheduler)).toBe(CustomScheduler);
  });

  test.each(['RAF', 'r', 'missing'])('rejects the ticker name %s', (name) => {
    expect(() => getTickerByType(name as TickerType)).toThrow(`Unknown ticker type: ${name}`);
  });

  test.each(['SPRING', 's', 'missing'])('rejects the scheduler name %s', (name) => {
    expect(() => getSchedulerByType(name as SchedulerType)).toThrow(
      `Unknown scheduler type: ${name}`,
    );
  });

  test.each([
    { request: true, cancel: true, ticker: RafSmoothTicker },
    { request: true, cancel: false, ticker: IntervalSmoothTicker },
    { request: false, cancel: true, ticker: IntervalSmoothTicker },
    { request: false, cancel: false, ticker: IntervalSmoothTicker },
  ])(
    'selects the default ticker with request=$request and cancel=$cancel',
    ({ request, cancel, ticker }) => {
      stubGlobal('requestAnimationFrame', request ? rstest.fn() : undefined);

      stubGlobal('cancelAnimationFrame', cancel ? rstest.fn() : undefined);

      expect(isEnableRAF()).toBe(request && cancel);

      for (const enabled of [true, false]) {
        expect(toSmoothConfig(enabled)).toEqual({
          enabled,
          ticker,
          scheduler: SpringSmoothScheduler,
        });
      }
    },
  );

  test('uses an explicit configuration regardless of available RAF APIs', () => {
    stubGlobal('requestAnimationFrame', rstest.fn());

    stubGlobal('cancelAnimationFrame', rstest.fn());

    const result = toSmoothConfig({ enabled: true, ticker: 'interval', scheduler: 'spring' });

    expect(result).toEqual({
      enabled: true,
      ticker: IntervalSmoothTicker,
      scheduler: SpringSmoothScheduler,
    });

    expectTypeOf(result).toEqualTypeOf<BaseSmoothConfig>();

    expect(toSmoothConfig({ ticker: 'raf', scheduler: 'spring' }).enabled).toBe(false);
  });
});
