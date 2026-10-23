import { assert } from '@fluxdown/utils';
import { expectTypeOf } from 'expect-type';
import { mapClosure, MutableState, ReactiveState, render, S } from 'stative';

import type { SmoothDriverClass } from '../../../../..';
import type { SmoothTick } from '../states';

import { SmoothTicks } from '..';
import {
  latest,
  PrimarySmoothDriver,
  resetSmoothTests,
  SecondarySmoothDriver,
} from '../../../../../__tests__/utils';

const setupTicks = (active = true) => {
  const enabled = MutableState.of(active);

  const lengths = MutableState.of([3]);

  const revisions = mapClosure(lengths, (sizes) =>
    sizes.map((length) => ({ length, prefixLength: Infinity })),
  );

  const driver = MutableState.of<SmoothDriverClass>(PrimarySmoothDriver);

  const ticks = render(S([SmoothTicks, { enabled, revisions, driver }]));

  return { enabled, lengths, driver, ticks };
};

beforeEach(resetSmoothTests);

describe('SmoothTicks', () => {
  test('waits for content growth and follows the active driver timestamps', () => {
    const { lengths, ticks } = setupTicks();

    expect(PrimarySmoothDriver.instances).toEqual([]);

    expectTypeOf(ticks.value.value).toEqualTypeOf<SmoothTick | null>();

    expect(ticks.value.value).toBeNull();

    expect(PrimarySmoothDriver.instances).toEqual([]);

    lengths.next([4]);

    const initial = ticks.value.value;

    const driver = latest(PrimarySmoothDriver.instances);

    expect(initial).toEqual({ driver, timestamp: 0 });

    driver.tick(16);

    expect(ticks.value.value).toEqual({ driver, timestamp: 16 });

    ticks.destroy();

    expect(driver.destroyCalls).toBe(1);

    expect(driver.running).toBe(false);
  });

  test('replaces owned drivers and releases previous instances', () => {
    const { lengths, ticks, driver } = setupTicks();

    const output = ticks.value;

    expect(output.value).toBeNull();

    lengths.next([4]);

    const previous = latest(PrimarySmoothDriver.instances);

    driver.next(PrimarySmoothDriver);

    expect(PrimarySmoothDriver.instances).toHaveLength(1);

    driver.next(SecondarySmoothDriver);

    const current = latest(SecondarySmoothDriver.instances);

    expect(previous.destroyCalls).toBe(1);

    expect(previous.running).toBe(false);

    expect(output.value).toEqual({ driver: current, timestamp: 0 });

    expect(() => previous.tick(16)).toThrow('Cannot tick a stopping driver');

    expect(output.value).toEqual({ driver: current, timestamp: 0 });

    current.tick(32);

    expect(output.value).toEqual({ driver: current, timestamp: 32 });

    ticks.destroy();

    expect(current.destroyCalls).toBe(1);

    expect(driver.closed).toBe(false);
  });

  test('ignores equal or shrinking totals and starts when a shortened stream grows again', () => {
    const { lengths, ticks } = setupTicks();

    expect(ticks.value.value).toBeNull();

    lengths.next([1, 2]);

    lengths.next([1]);

    expect(ticks.value.value).toBeNull();

    expect(PrimarySmoothDriver.instances).toEqual([]);

    lengths.next([2]);

    expect(latest(PrimarySmoothDriver.instances).running).toBe(true);

    lengths.next([1]);

    lengths.next([3]);

    expect(PrimarySmoothDriver.instances).toHaveLength(1);

    ticks.destroy();
  });

  test('creates no disabled driver and releases active work when disabled again', () => {
    const { enabled, lengths, ticks } = setupTicks(false);

    expect(ticks.value.value).toBeNull();

    expect(PrimarySmoothDriver.instances).toEqual([]);

    enabled.next(true);

    expect(ticks.value.value).toBeNull();

    lengths.next([4]);

    const driver = latest(PrimarySmoothDriver.instances);

    expect(ticks.value.value).toEqual({ driver, timestamp: 0 });

    enabled.next(false);

    expect(ticks.value.value).toBeNull();

    expect(driver.destroyCalls).toBe(1);

    enabled.next(true);

    expect(ticks.value.value).toBeNull();

    lengths.next([5]);

    expect(PrimarySmoothDriver.instances).toHaveLength(2);

    ticks.destroy();

    expect(PrimarySmoothDriver.instances.every((item) => item.destroyCalls === 1)).toBe(true);

    expect(enabled.closed).toBe(false);
  });

  test('waits for new enabled growth after content changes while disabled', () => {
    const { enabled, lengths, ticks } = setupTicks(false);

    expect(ticks.value.value).toBeNull();

    lengths.next([4]);

    enabled.next(true);

    expect(ticks.value.value).toBeNull();

    expect(PrimarySmoothDriver.instances).toEqual([]);

    lengths.next([5]);

    expect(latest(PrimarySmoothDriver.instances).running).toBe(true);

    ticks.destroy();
  });

  test('keeps the selected driver alive after its configuration completes', () => {
    const lengths = MutableState.of([3]);

    const ticks = render(
      S([
        SmoothTicks,
        {
          enabled: ReactiveState.of(true),
          revisions: mapClosure(lengths, (sizes) =>
            sizes.map((length) => ({ length, prefixLength: Infinity })),
          ),
          driver: ReactiveState.of(PrimarySmoothDriver),
        },
      ]),
    );

    const complete = jest.fn();

    ticks.value.subscribe({ complete });

    lengths.next([4]);

    lengths.complete();

    const driver = latest(PrimarySmoothDriver.instances);

    driver.tick(16);

    expect(ticks.value.value).toEqual({ driver, timestamp: 16 });

    expect(complete).not.toHaveBeenCalled();

    ticks.destroy();

    expect(complete).toHaveBeenCalledTimes(1);

    expect(driver.destroyCalls).toBe(1);
  });

  test('releases a driver that finishes its own timestamp stream', () => {
    class FinishingDriver extends PrimarySmoothDriver {
      finish() {
        this.subject.complete();
      }
    }

    const { lengths, ticks, driver } = setupTicks();

    driver.next(FinishingDriver);

    const output = ticks.value;

    expect(output.value).toBeNull();

    lengths.next([4]);

    const current = latest(PrimarySmoothDriver.instances);

    assert(current instanceof FinishingDriver);

    current.tick(16);

    current.finish();

    expect(output.value).toEqual({ driver: current, timestamp: 16 });

    expect(output.closed).toBe(false);

    expect(current.running).toBe(false);

    expect(current.destroyCalls).toBe(1);

    driver.next(PrimarySmoothDriver);

    expect(latest(PrimarySmoothDriver.instances).running).toBe(true);

    ticks.destroy();

    expect(current.destroyCalls).toBe(1);
  });
});
