import type { IBlockState, IRangeState } from '@fluxdown/types';

import { Shad } from '@fluxdown/core-presets/mapper';
import {
  type IReactiveState,
  type IReadableClosure,
  MutableState,
  once,
  ReactiveState,
  render,
  S,
  useMap,
} from 'stative';

import type { HastRoot } from '../../typings';

import { countStateObservers } from '../../../../../scripts/testing/state';
import {
  collectText,
  createBlock,
  firstBlock,
  latest,
  paragraph,
  PrimarySmoothDriver,
  resetSmoothTests,
  setupSmooth,
} from '../smooth/utils';
import { readFades } from './utils';

const cleanups = new Set<() => void>();

const setup = (
  source: IReadableClosure<IBlockState<HastRoot>[]> | IReactiveState<IBlockState<HastRoot>[]>,
  enabled = true,
) => {
  const state = render(
    S([Shad, { source, enabled: ReactiveState.of(enabled), length: ReactiveState.of(2) }]),
  );

  cleanups.add(() => state.destroy());

  return state;
};

const Uppercase = once(function Uppercase({ source }: { source: IReadableClosure<HastRoot> }) {
  return useMap(source, (root) => paragraph(collectText(root).toUpperCase()));
});

beforeEach(() => {
  jest.useFakeTimers();

  resetSmoothTests();
});

afterEach(() => {
  cleanups.forEach((cleanup) => cleanup());

  cleanups.clear();

  jest.useRealTimers();
});

describe('Shad forks', () => {
  test.each([false, true])('honors a downstream reactive range with shad %s', (enabled) => {
    const source = createBlock('a', paragraph('abcdef'));

    const blocks = MutableState.of([source.block]);

    const state = setup(blocks, enabled);

    const main = firstBlock(state.value.value);

    expect(collectText(main.value.value)).toBe('abcdef');

    const range = MutableState.of<IRangeState | null>({ start: 1, end: 3 });

    const meta = MutableState.of({ ...main.meta.value, key: 'downstream' });

    const downstream = main.fork({ range, meta });

    cleanups.add(() => downstream.destroy());

    const destroyMain = jest.spyOn(main, 'destroy');

    const destroySource = jest.spyOn(source.block, 'destroy');

    expect(collectText(downstream.value.value)).toBe('bc');

    expect(downstream.length.value).toBe(2);

    expect(downstream.baseLength.value).toBe(6);

    expect(downstream.meta.value).toEqual(meta.value);

    expect(main.meta.value.key).toBe('a');

    range.next({ start: 0, end: 4 });

    expect(collectText(downstream.value.value)).toBe('abcd');

    expect(downstream.range.value).toEqual({ start: 0, end: 4 });

    meta.next({ ...meta.value, key: 'updated' });

    expect(downstream.meta.value.key).toBe('updated');

    expect(collectText(main.value.value)).toBe('abcdef');

    source.source.next(paragraph('ABCDEFG'));

    expect(collectText(downstream.value.value)).toBe('ABCD');

    expect(downstream.length.value).toBe(4);

    expect(downstream.baseLength.value).toBe(7);

    downstream.destroy();

    expect(destroyMain).not.toHaveBeenCalled();

    expect(destroySource).not.toHaveBeenCalled();

    expect(range.closed).toBe(false);

    expect(countStateObservers(range)).toBe(0);

    expect(meta.closed).toBe(false);

    expect(countStateObservers(meta)).toBe(0);

    source.source.next(paragraph('ABCDEFGH'));

    expect(collectText(main.value.value)).toBe('ABCDEFGH');

    if (enabled) {
      // Every character after the initial content plays its own fade, ending with the new 'H'.
      expect(
        readFades(main.value.value)
          .map(({ text }) => text)
          .join(''),
      ).toBe('ABCDEFGH');
    }

    state.destroy();

    expect(countStateObservers(blocks)).toBe(0);

    expect(countStateObservers(source.block.length)).toBe(0);

    expect(source.source.closed).toBe(false);

    expect(jest.getTimerCount()).toBe(0);
  });

  test('expands a downstream range beyond the partially revealed Smooth source', () => {
    const source = createBlock('a', paragraph('abcdef'));

    const smooth = setupSmooth();

    cleanups.add(() => smooth.state.destroy());

    const state = setup(smooth.state);

    expect(state.value.value).toEqual([]);

    smooth.source.next([source.block]);

    const driver = latest(PrimarySmoothDriver.instances);

    driver.tick(16);

    driver.tick(32);

    const main = firstBlock(state.value.value);

    expect(collectText(main.value.value)).toBe('ab');

    const range = MutableState.of<IRangeState | null>({ start: 0, end: 5 });

    const downstream = main.fork({ range });

    cleanups.add(() => downstream.destroy());

    expect(collectText(downstream.value.value)).toBe('abcde');

    expect(downstream.length.value).toBe(5);

    expect(downstream.baseLength.value).toBe(6);

    driver.tick(48);

    expect(collectText(main.value.value)).toBe('abc');

    expect(collectText(downstream.value.value)).toBe('abcde');

    range.next({ start: 1, end: 6 });

    expect(collectText(downstream.value.value)).toBe('bcdef');

    expect(main.range.value).toEqual({ start: 0, end: 3 });
  });

  test('retains an earlier mapper when downstream forks override the range', () => {
    const source = createBlock('a', paragraph('abcdef'));

    const earlierRange = MutableState.of<IRangeState | null>({ start: 0, end: 2 });

    const previous = source.block.fork({
      range: earlierRange,
      mapper: (value) => render(S([Uppercase, { source: value }])),
    });

    cleanups.add(() => previous.destroy());

    const state = setup(MutableState.of([previous]));

    const main = firstBlock(state.value.value);

    expect(collectText(main.value.value)).toBe('AB');

    const downstream = main.fork({
      range: MutableState.of<IRangeState | null>({ start: 1, end: 5 }),
    });

    cleanups.add(() => downstream.destroy());

    expect(collectText(downstream.value.value)).toBe('BCDE');

    source.source.next(paragraph('uvwxyz'));

    expect(collectText(main.value.value)).toBe('UV');

    expect(collectText(downstream.value.value)).toBe('VWXY');

    downstream.destroy();

    expect(collectText(previous.value.value)).toBe('UV');

    expect(source.source.closed).toBe(false);
  });

  test('retains independent mapped output after the original block is destroyed', () => {
    const source = createBlock('a', paragraph('abc'));

    const state = setup(MutableState.of([source.block]));

    const main = firstBlock(state.value.value);

    expect(collectText(main.value.value)).toBe('abc');

    source.block.destroy();

    source.source.next(paragraph('abcd'));

    expect(collectText(main.value.value)).toBe('abcd');

    expect(main.length.value).toBe(4);

    state.destroy();

    expect(source.source.closed).toBe(false);

    expect(countStateObservers(source.source)).toBe(0);

    expect(jest.getTimerCount()).toBe(0);
  });
});
