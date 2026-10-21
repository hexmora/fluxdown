import type { IBlockState } from '@fluxdown/types';

import { expectTypeOf } from 'expect-type';
import {
  batch,
  type IReadableClosure,
  mapClosure,
  MutableState,
  ReactiveState,
  render,
  S,
  toClosure,
} from 'stative';

import type { SmoothInterpolatorClass } from '../../..';
import type { SmoothPosition } from '../states';

import { SmoothCursor } from '..';
import { ArrayBlock, createArrayBlock } from '../../../__tests__/block';
import { latest, PrimarySmoothDriver, resetSmoothTests } from '../../../__tests__/utils';
import { SpringSmoothInterpolator } from '../../../modules';
import {
  StepSmoothInterpolator,
  TargetInterpolator,
} from '../../../modules/interpolation/__tests__/utils';

const setupCursor = (
  initial: IBlockState<number[]>[] = [],
  active = true,
  Interpolator: SmoothInterpolatorClass = StepSmoothInterpolator,
) => {
  const source = MutableState.of(initial);

  const enabled = MutableState.of(active);

  const cursor = render(
    S([
      SmoothCursor<number[]>,
      {
        source: toClosure(source),
        enabled: toClosure(enabled),
        driver: toClosure(ReactiveState.of(PrimarySmoothDriver)),
        interpolation: toClosure(ReactiveState.of(Interpolator)),
      },
    ]),
  );

  return { cursor, source, enabled };
};

beforeEach(resetSmoothTests);

describe('SmoothCursor', () => {
  test.each([
    { values: [], end: { blockIndex: -1, charIndex: 0 } },
    { values: [[], []], end: { blockIndex: 1, charIndex: 0 } },
    { values: [[1, 2], []], end: { blockIndex: 1, charIndex: 0 } },
    { values: [[], [1, 2], [3]], end: { blockIndex: 2, charIndex: 1 } },
  ])('locates initial progress for $values', ({ values, end }) => {
    const blocks = values.map((value) => createArrayBlock(value).block);

    const { cursor } = setupCursor(blocks);

    expectTypeOf(cursor).toEqualTypeOf<IReadableClosure<SmoothPosition>>();

    expectTypeOf(cursor.value.value).toEqualTypeOf<SmoothPosition>();

    expect(cursor.value.value).toEqual(end);

    cursor.destroy();
  });

  test.each([
    { lengths: [3, 3], step: -1, end: { blockIndex: 0, charIndex: 0 } },
    { lengths: [3, 3], step: 100, end: { blockIndex: 1, charIndex: 3 } },
    { lengths: [3, 3], step: 3, end: { blockIndex: 0, charIndex: 3 } },
    { lengths: [0, 3], step: 0, end: { blockIndex: 0, charIndex: 0 } },
  ])('locates a step of $step in $lengths', ({ lengths, step, end }) => {
    class Interpolator extends StepSmoothInterpolator {
      override tick() {
        return step;
      }
    }

    const { cursor, source } = setupCursor([], true, Interpolator);

    expect(cursor.value.value).toEqual({ blockIndex: -1, charIndex: 0 });

    source.next(lengths.map((length) => createArrayBlock(Array<number>(length).fill(0)).block));

    latest(PrimarySmoothDriver.instances).tick(16);

    expect(cursor.value.value).toEqual(end);

    cursor.destroy();
  });

  test('advances across empty blocks and exact boundaries using only block lengths', () => {
    const { cursor, source } = setupCursor();

    expect(cursor.value.value).toEqual({ blockIndex: -1, charIndex: 0 });

    const blocks = [[], [1, 2], [], [3]].map((value) => createArrayBlock(value).block);

    const reads = blocks.map((block) => jest.spyOn(block, 'value', 'get'));

    const forks = blocks.map((block) => jest.spyOn(block, 'fork'));

    source.next(blocks);

    expect(cursor.value.value).toEqual({ blockIndex: 0, charIndex: 0 });

    const driver = latest(PrimarySmoothDriver.instances);

    driver.tick(16);

    expect(cursor.value.value).toEqual({ blockIndex: 1, charIndex: 1 });

    driver.tick(32);

    expect(cursor.value.value).toEqual({ blockIndex: 1, charIndex: 2 });

    driver.tick(48);

    expect(cursor.value.value).toEqual({ blockIndex: 3, charIndex: 1 });

    for (const operation of [...reads, ...forks]) {
      expect(operation).not.toHaveBeenCalled();
    }

    cursor.destroy();
  });

  test('tracks replacement lengths without emitting an unchanged endpoint', () => {
    const first = createArrayBlock([1, 2]);

    const next = createArrayBlock([3, 4]);

    const { cursor, source, enabled } = setupCursor([first.block], false);

    const changed = jest.fn();

    cursor.value.subscribe(changed);

    source.next([next.block]);

    first.source.next([1, 2, 3, 4, 5]);

    expect(changed).toHaveBeenCalledTimes(1);

    next.source.next([3, 4, 5]);

    expect(cursor.value.value).toEqual({ blockIndex: 0, charIndex: Infinity });

    expect(changed).toHaveBeenCalledTimes(1);

    enabled.next(true);

    expect(cursor.value.value).toEqual({ blockIndex: 0, charIndex: 3 });

    expect(changed).toHaveBeenCalledTimes(2);

    cursor.destroy();
  });

  test('preserves absolute progress when block lengths change in one batch', () => {
    const first = createArrayBlock([1, 2, 3, 4, 5]);

    const second = createArrayBlock([6]);

    const { cursor } = setupCursor([first.block, second.block]);

    expect(cursor.value.value).toEqual({ blockIndex: 1, charIndex: 1 });

    batch(() => {
      first.source.next([1]);

      second.source.next([2, 3, 4, 5, 6]);
    });

    expect(cursor.value.value).toEqual({ blockIndex: 1, charIndex: 5 });

    cursor.destroy();
  });

  test('waits for differently derived block lengths before applying an atomic edit', () => {
    const first = createArrayBlock([1, 2, 3, 4, 5]);

    const second = createArrayBlock([6]);

    let source = second.block.inputs.source;

    for (let depth = 0; depth < 3; depth++) {
      source = mapClosure(source, (value) => value);
    }

    const derived = new ArrayBlock<number>({ ...second.block.inputs, source });

    const { cursor } = setupCursor([first.block, derived]);

    expect(cursor.value.value).toEqual({ blockIndex: 1, charIndex: 1 });

    batch(() => {
      first.source.next([1]);

      second.source.next([2, 3, 4, 5, 6]);
    });

    expect(cursor.value.value).toEqual({ blockIndex: 1, charIndex: 5 });

    cursor.destroy();

    derived.destroy();
  });

  test('keeps an interpolator with the default idle behavior running until disabled', () => {
    const block = createArrayBlock<number>([]);

    const { cursor, enabled } = setupCursor([block.block], true, TargetInterpolator);

    expect(cursor.value.value.charIndex).toBe(0);

    block.source.next([1]);

    const driver = latest(PrimarySmoothDriver.instances);

    driver.tick(16);

    expect(cursor.value.value.charIndex).toBe(1);

    expect(driver.running).toBe(true);

    driver.tick(32);

    expect(cursor.value.value.charIndex).toBe(1);

    expect(driver.running).toBe(true);

    enabled.next(false);

    expect(driver.running).toBe(false);

    expect(driver.destroyCalls).toBe(1);

    cursor.destroy();
  });

  test('stops once the spring reveals everything and resumes from the paused timestamp', () => {
    const block = createArrayBlock<number>([]);

    const { cursor } = setupCursor([block.block], true, SpringSmoothInterpolator);

    expect(cursor.value.value.charIndex).toBe(0);

    expect(PrimarySmoothDriver.instances).toHaveLength(0);

    block.source.next([1]);

    const driver = latest(PrimarySmoothDriver.instances);

    let timestamp = 0;

    while (driver.running && timestamp < 1000) {
      timestamp += 16;

      driver.tick(timestamp);
    }

    expect(cursor.value.value.charIndex).toBe(1);

    expect(driver.running).toBe(false);

    driver.advanceTo(10_000);

    block.source.next([1, 2, 3]);

    expect(driver.running).toBe(true);

    // A trajectory still anchored before the pause would reveal everything on this frame.
    driver.tick(10_016);

    expect(cursor.value.value.charIndex).toBe(1);

    timestamp = 10_016;

    while (driver.running && timestamp < 11_000) {
      timestamp += 16;

      driver.tick(timestamp);
    }

    expect(cursor.value.value.charIndex).toBe(3);

    expect(driver.running).toBe(false);

    cursor.destroy();
  });

  test('stops immediately on completion even while the interpolator is busy', () => {
    const block = createArrayBlock<number>([]);

    const { cursor, source, enabled } = setupCursor([block.block], true, TargetInterpolator);

    expect(cursor.value.value.charIndex).toBe(0);

    block.source.next([1]);

    const driver = latest(PrimarySmoothDriver.instances);

    driver.tick(1);

    expect(driver.running).toBe(true);

    batch(() => {
      block.source.complete();

      source.complete();

      enabled.complete();
    });

    expect(cursor.value.value.charIndex).toBe(1);

    expect(cursor.value.closed).toBe(true);

    expect(driver.running).toBe(false);

    expect(driver.destroyCalls).toBe(1);

    cursor.destroy();
  });
});
