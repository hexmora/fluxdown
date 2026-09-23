import type { IBlockState } from '@fluxdown/types';

import { batch, MutableState, ReactiveState, render, S } from 'stative';

import { BlockRevisions } from '..';
import { createArrayBlock } from '../../../../../__tests__/block';
import { observerCount } from '../../../../../__tests__/utils';

describe('BlockRevisions', () => {
  test('keeps observing block lengths after the source list completes', () => {
    const block = createArrayBlock([1, 2]);

    const source = ReactiveState.of([block.block]);

    const state = render(S([BlockRevisions<number[]>, { source }]));

    const complete = jest.fn();

    state.value.subscribe({ complete });

    expect(state.value.value.map(({ length }) => length)).toEqual([2]);

    block.source.next([1, 2, 3]);

    expect(state.value.value.map(({ length }) => length)).toEqual([3]);

    expect(complete).not.toHaveBeenCalled();

    block.source.complete();

    expect(complete).toHaveBeenCalledTimes(1);

    state.destroy();
  });

  test('replaces subscriptions even when a new source has the same lengths', () => {
    const a = createArrayBlock([1, 2]);

    const b = createArrayBlock([3, 4]);

    const source = MutableState.of([a.block]);

    const state = render(S([BlockRevisions<number[]>, { source }]));

    const changed = jest.fn();

    state.value.subscribe(changed);

    source.next([b.block]);

    expect(changed).toHaveBeenCalledTimes(2);

    expect(observerCount(a.block.baseLength)).toBe(0);

    expect(observerCount(b.block.baseLength)).toBeGreaterThan(0);

    a.source.next([1, 2, 3, 4]);

    expect(changed).toHaveBeenCalledTimes(2);

    b.source.next([3, 4, 5]);

    expect(state.value.value.map(({ length }) => length)).toEqual([3]);

    state.destroy();

    expect(observerCount(b.block.baseLength)).toBe(0);

    expect(source.closed).toBe(false);
  });

  test('publishes only the final length vector of an atomic edit', () => {
    const a = createArrayBlock([1, 2, 3]);

    const b = createArrayBlock([4]);

    const source = MutableState.of([a.block, b.block]);

    const state = render(S([BlockRevisions<number[]>, { source }]));

    const frames: number[][] = [];

    state.value.subscribe((revisions) => frames.push(revisions.map(({ length }) => length)));

    batch(() => {
      a.source.next([1]);

      b.source.next([2, 3, 4]);
    });

    expect(frames).toEqual([
      [3, 1],
      [1, 3],
    ]);

    state.destroy();
  });

  test('forwards a block error and immediately releases every length subscription', () => {
    const a = createArrayBlock([1, 2]);

    const b = createArrayBlock([3, 4]);

    const source = MutableState.of([a.block, b.block]);

    const state = render(S([BlockRevisions<number[]>, { source }]));

    const error = jest.fn();

    state.value.subscribe({ error });

    const failure = new Error('Cannot read block length.');

    a.source.error(failure);

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(failure);

    expect(observerCount(b.block.baseLength)).toBe(0);

    expect(source.closed).toBe(false);

    state.destroy();

    expect(observerCount(source)).toBe(0);
  });

  test('initializes from a pending source update and keeps observing the committed blocks', () => {
    const a = createArrayBlock([1]);

    const b = createArrayBlock([2, 3]);

    const source = MutableState.of([a.block]);

    const state = render(S([BlockRevisions<number[]>, { source }]));

    batch(() => {
      source.next([b.block]);

      expect(state.value.value.map(({ length }) => length)).toEqual([2]);
    });

    expect(observerCount(a.block.baseLength)).toBe(0);

    b.source.next([2, 3, 4]);

    expect(state.value.value.map(({ length }) => length)).toEqual([3]);

    state.destroy();
  });

  test('initializes from pending length and prefix without replacing them with committed values', () => {
    const block: IBlockState<number[]> = createArrayBlock([1]).block;

    const length = MutableState.of(1);

    const prefix = MutableState.of(Infinity);

    jest.spyOn(block, 'baseLength', 'get').mockReturnValue(length);

    block.prevPrefixLength = prefix;

    const source = ReactiveState.of([block]);

    const state = render(S([BlockRevisions<number[]>, { source }]));

    batch(() => {
      length.next(3);

      prefix.next(0);

      expect(state.value.value).toEqual([{ length: 3, prefixLength: 0 }]);
    });

    length.next(4);

    prefix.next(Infinity);

    expect(state.value.value).toEqual([{ length: 4, prefixLength: Infinity }]);

    state.destroy();
  });
});
