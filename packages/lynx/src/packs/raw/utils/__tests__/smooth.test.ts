import type {
  BaseSmoothConfig,
  DriverParams,
  DriverType,
  InterpolationType,
  InterpolatorParams,
  SmoothDriverClass,
  SmoothInterpolatorClass,
} from '@fluxdown/core-plugins/plugins/mapper/smooth';

import {
  IntervalSmoothDriver,
  RafSmoothDriver,
  SpringSmoothInterpolator,
} from '@fluxdown/core-plugins/plugins/mapper/smooth';
import { isEnableRAF } from '@fluxdown/utils';
import { afterEach, describe, expect, rstest, test } from '@rstest/core';
import { expectTypeOf } from 'expect-type';

import { getDriverByType, getInterpolationByType, toSmoothConfig, toStreamingConfig } from '..';
import { restoreGlobals, stubGlobal } from '../../../../../../../scripts/testing/globals';
import { ALL_DRIVERS, ALL_INTERPOLATORS } from '../../../../consts';

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
    expect(ALL_DRIVERS).toEqual([RafSmoothDriver, IntervalSmoothDriver]);

    expect(ALL_INTERPOLATORS).toEqual([SpringSmoothInterpolator]);

    expectTypeOf<DriverType>().toEqualTypeOf<'raf' | 'interval'>();

    expectTypeOf<InterpolationType>().toEqualTypeOf<'spring'>();

    expectTypeOf<DriverParams>().toEqualTypeOf<[interval?: number]>();

    expectTypeOf<InterpolatorParams>().toEqualTypeOf<[tuple?: number[]]>();

    expectTypeOf<typeof RafSmoothDriver>().toMatchTypeOf<SmoothDriverClass>();

    expectTypeOf<typeof SpringSmoothInterpolator>().toMatchTypeOf<SmoothInterpolatorClass>();
  });

  test('resolves exact runtime names and preserves custom constructors', () => {
    expect(getDriverByType('raf')).toBe(RafSmoothDriver);

    expect(getDriverByType('interval')).toBe(IntervalSmoothDriver);

    expect(getInterpolationByType('spring')).toBe(SpringSmoothInterpolator);

    class CustomDriver extends RafSmoothDriver {}

    class CustomInterpolator extends SpringSmoothInterpolator {}

    expect(getDriverByType(CustomDriver)).toBe(CustomDriver);

    expect(getInterpolationByType(CustomInterpolator)).toBe(CustomInterpolator);
  });

  test.each(['RAF', 'r', 'missing'])('rejects the driver name %s', (name) => {
    expect(() => getDriverByType(name as DriverType)).toThrow(`Unknown driver type: ${name}`);
  });

  test.each(['SPRING', 's', 'missing'])('rejects the interpolation name %s', (name) => {
    expect(() => getInterpolationByType(name as InterpolationType)).toThrow(
      `Unknown interpolation type: ${name}`,
    );
  });

  test.each([
    { request: true, cancel: true, driver: RafSmoothDriver },
    { request: true, cancel: false, driver: IntervalSmoothDriver },
    { request: false, cancel: true, driver: IntervalSmoothDriver },
    { request: false, cancel: false, driver: IntervalSmoothDriver },
  ])(
    'selects the default driver with request=$request and cancel=$cancel',
    ({ request, cancel, driver }) => {
      stubGlobal('requestAnimationFrame', request ? rstest.fn() : undefined);

      stubGlobal('cancelAnimationFrame', cancel ? rstest.fn() : undefined);

      expect(isEnableRAF()).toBe(request && cancel);

      for (const enabled of [true, false]) {
        expect(toSmoothConfig(enabled)).toEqual({
          enabled,
          driver,
          interpolation: SpringSmoothInterpolator,
        });
      }
    },
  );

  test('uses an explicit configuration regardless of available RAF APIs', () => {
    stubGlobal('requestAnimationFrame', rstest.fn());

    stubGlobal('cancelAnimationFrame', rstest.fn());

    const result = toSmoothConfig({ enabled: true, driver: 'interval', interpolation: 'spring' });

    expect(result).toEqual({
      enabled: true,
      driver: IntervalSmoothDriver,
      interpolation: SpringSmoothInterpolator,
    });

    expectTypeOf(result).toEqualTypeOf<BaseSmoothConfig>();

    expect(toSmoothConfig({ driver: 'raf', interpolation: 'spring' }).enabled).toBe(false);
  });

  test('defaults omitted driver and interpolation like the boolean form', () => {
    stubGlobal('requestAnimationFrame', rstest.fn());

    stubGlobal('cancelAnimationFrame', rstest.fn());

    expect(toSmoothConfig({ enabled: true })).toEqual({
      enabled: true,
      driver: RafSmoothDriver,
      interpolation: SpringSmoothInterpolator,
    });
  });

  test('accepts the deprecated ticker and scheduler names when the new ones are absent', () => {
    class CustomInterpolator extends SpringSmoothInterpolator {}

    expect(
      toSmoothConfig({ enabled: true, ticker: 'interval', scheduler: CustomInterpolator }),
    ).toEqual({ enabled: true, driver: IntervalSmoothDriver, interpolation: CustomInterpolator });

    expect(
      toSmoothConfig({
        ticker: 'interval',
        driver: 'raf',
        scheduler: CustomInterpolator,
        interpolation: 'spring',
      }),
    ).toEqual({ enabled: false, driver: RafSmoothDriver, interpolation: SpringSmoothInterpolator });
  });
});
