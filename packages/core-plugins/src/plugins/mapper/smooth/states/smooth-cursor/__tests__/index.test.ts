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

import type { SmoothSchedulerClass, SmoothTickerClass } from '../../..';
import type { SmoothPosition } from '../states';

import { SmoothCursor } from '..';
import { ArrayBlock, createArrayBlock } from '../../../__tests__/block';
import { latest, PrimarySmoothTicker, resetSmoothTests } from '../../../__tests__/utils';
import { SpringSmoothScheduler } from '../../../modules';
import { StepSmoothScheduler, TargetScheduler } from '../../../modules/scheduler/__tests__/utils';

const setupCursor = (
  initial: IBlockState<number[]>[] = [],
  active = true,
  Scheduler: SmoothSchedulerClass = StepSmoothScheduler,
  Ticker: SmoothTickerClass = PrimarySmoothTicker,
) => {
  const source = MutableState.of(initial);

  const enabled = MutableState.of(active);

  const cursor = render(
    S([
      SmoothCursor<number[]>,
      {
        source: toClosure(source),
        enabled: toClosure(enabled),
        ticker: toClosure(ReactiveState.of(Ticker)),
        scheduler: toClosure(ReactiveState.of(Scheduler)),
      },
    ]),
  );

  return { cursor, source, enabled };
};

beforeEach(resetSmoothTests);

describe('SmoothCursor', () => {
  test('seeds newly started content at its arrival instead of decaying an empty old frame', () => {
    class Ticker extends PrimarySmoothTicker {
      now() {
        return 100;
      }
    }

    class Scheduler extends SpringSmoothScheduler {
      protected override readonly defaultTuple = [1000, 0, 0, 0, 1000];
    }

    const block = createArrayBlock<number>([]);

    const { cursor } = setupCursor([block.block], true, Scheduler, Ticker);

    expect(cursor.value.value.charIndex).toBe(0);

    block.source.next(Array<number>(10).fill(0));

    const ticker = latest(PrimarySmoothTicker.instances);

    ticker.tick(101);

    expect(cursor.value.value.charIndex).toBe(1);

    cursor.destroy();
  });

  test.each([
    { name: 'shortened content', values: [0, 1, 2], prefixLength: 3, expected: 3 },
    { name: 'a rewritten prefix', values: [10, 11, 12], prefixLength: 0, expected: 1 },
  ])('resets timing at the arrival of $name', ({ values, prefixLength, expected }) => {
    let timestamp = 0;

    class Ticker extends PrimarySmoothTicker {
      now() {
        return timestamp;
      }
    }

    class Scheduler extends SpringSmoothScheduler {
      protected override readonly defaultTuple = [1000, 0, 0, 0, 1000];
    }

    const block = createArrayBlock<number>([]);

    const state: IBlockState<number[]> = block.block;

    const prefix = MutableState.of(Infinity);

    state.prevPrefixLength = prefix;

    const { cursor } = setupCursor([state], true, Scheduler, Ticker);

    expect(cursor.value.value.charIndex).toBe(0);

    batch(() => {
      block.source.next(Array.from({ length: 10 }, (_, index) => index));

      prefix.next(10);
    });

    const ticker = latest(PrimarySmoothTicker.instances);

    timestamp = 2;

    ticker.tick(2);

    expect(cursor.value.value.charIndex).toBe(2);

    timestamp = 100;

    batch(() => {
      block.source.next(values);

      prefix.next(prefixLength);
    });

    timestamp = 101;

    ticker.tick(101);

    expect(cursor.value.value.charIndex).toBe(expected);

    cursor.destroy();
  });

  test('uses the custom ticker clock for arrivals without emitting between frames', () => {
    let timestamp = 0;

    class Ticker extends PrimarySmoothTicker {
      now() {
        return timestamp;
      }
    }

    class Scheduler extends SpringSmoothScheduler {
      protected override readonly defaultTuple = [1000, 0, 0, 1000, 1000];
    }

    const block = createArrayBlock<number>([]);

    const { cursor } = setupCursor([block.block], true, Scheduler, Ticker);

    expect(cursor.value.value.charIndex).toBe(0);

    block.source.next([1, 2]);

    const ticker = latest(PrimarySmoothTicker.instances);

    timestamp = 10;

    block.source.next(Array<number>(10).fill(0));

    expect(cursor.value.value.charIndex).toBe(0);

    ticker.tick(10);

    expect(cursor.value.value.charIndex).toBe(2);

    timestamp = 15;

    ticker.tick(15);

    expect(cursor.value.value.charIndex).toBe(7);

    cursor.destroy();
  });

  test('keeps custom tickers without now and one-argument schedulers compatible', () => {
    const block = createArrayBlock<number>([]);

    const { cursor } = setupCursor([block.block]);

    expect(cursor.value.value.charIndex).toBe(0);

    block.source.next([1]);

    const scheduler = latest(StepSmoothScheduler.instances);

    const push = jest.spyOn(scheduler, 'push');

    const ticker = latest(PrimarySmoothTicker.instances);

    block.source.next([1, 2]);

    expect(push).toHaveBeenCalledWith(1, undefined);

    expect(cursor.value.value.charIndex).toBe(0);

    ticker.tick(16);

    expect(cursor.value.value.charIndex).toBe(1);

    cursor.destroy();
  });

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
    class Scheduler extends StepSmoothScheduler {
      override tick() {
        return step;
      }
    }

    const { cursor, source } = setupCursor([], true, Scheduler);

    expect(cursor.value.value).toEqual({ blockIndex: -1, charIndex: 0 });

    source.next(lengths.map((length) => createArrayBlock(Array<number>(length).fill(0)).block));

    latest(PrimarySmoothTicker.instances).tick(16);

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

    const ticker = latest(PrimarySmoothTicker.instances);

    ticker.tick(16);

    expect(cursor.value.value).toEqual({ blockIndex: 1, charIndex: 1 });

    ticker.tick(32);

    expect(cursor.value.value).toEqual({ blockIndex: 1, charIndex: 2 });

    ticker.tick(48);

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

  test('keeps a scheduler with the default idle behavior running until disabled', () => {
    const block = createArrayBlock<number>([]);

    const { cursor, enabled } = setupCursor([block.block], true, TargetScheduler);

    expect(cursor.value.value.charIndex).toBe(0);

    block.source.next([1]);

    const ticker = latest(PrimarySmoothTicker.instances);

    ticker.tick(16);

    expect(cursor.value.value.charIndex).toBe(1);

    expect(ticker.running).toBe(true);

    ticker.tick(32);

    expect(cursor.value.value.charIndex).toBe(1);

    expect(ticker.running).toBe(true);

    enabled.next(false);

    expect(ticker.running).toBe(false);

    expect(ticker.destroyCalls).toBe(1);

    cursor.destroy();
  });

  test('preserves momentum across short gaps and resumes a settled spring without restarting', () => {
    class Scheduler extends SpringSmoothScheduler {
      protected override readonly defaultTuple = [1000, 0, 0, 100, 1000];
    }

    const block = createArrayBlock<number>([]);

    const { cursor } = setupCursor([block.block], true, Scheduler);

    expect(cursor.value.value.charIndex).toBe(0);

    expect(PrimarySmoothTicker.instances).toHaveLength(0);

    block.source.next([1]);

    const ticker = latest(PrimarySmoothTicker.instances);

    ticker.tick(1);

    expect(cursor.value.value.charIndex).toBe(1);

    expect(ticker.running).toBe(true);

    ticker.tick(17);

    block.source.next([1, 2]);

    ticker.tick(18);

    expect(cursor.value.value.charIndex).toBe(1);

    ticker.tick(19);

    expect(cursor.value.value.charIndex).toBe(2);

    for (let frame = 1; frame <= 30 && ticker.running; frame += 1) {
      ticker.tick(19 + frame * 16);
    }

    expect(ticker.running).toBe(false);

    ticker.advanceTo(10_000);

    block.source.next([1, 2, 3]);

    expect(ticker.running).toBe(true);

    ticker.tick(10_005);

    expect(cursor.value.value.charIndex).toBe(2);

    ticker.tick(10_010);

    expect(cursor.value.value.charIndex).toBe(3);

    expect(ticker.running).toBe(false);

    cursor.destroy();
  });

  test('stops immediately on completion even while a spring still has idle momentum', () => {
    class Scheduler extends SpringSmoothScheduler {
      protected override readonly defaultTuple = [1000, 0, 0, 100, 1000];
    }

    const block = createArrayBlock<number>([]);

    const { cursor, source, enabled } = setupCursor([block.block], true, Scheduler);

    expect(cursor.value.value.charIndex).toBe(0);

    block.source.next([1]);

    const ticker = latest(PrimarySmoothTicker.instances);

    ticker.tick(1);

    expect(ticker.running).toBe(true);

    batch(() => {
      block.source.complete();

      source.complete();

      enabled.complete();
    });

    expect(cursor.value.value.charIndex).toBe(1);

    expect(cursor.value.closed).toBe(true);

    expect(ticker.running).toBe(false);

    expect(ticker.destroyCalls).toBe(1);

    cursor.destroy();
  });
});
