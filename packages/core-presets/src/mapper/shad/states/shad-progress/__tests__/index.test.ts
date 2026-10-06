import type { IBlockMeta, IBlockState, IRangeState } from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

import {
  batch,
  type IReactiveState,
  type IReadableClosure,
  MutableState,
  ReactiveState,
  render,
  S,
} from 'stative';

import { ShadProgress } from '..';

const createBlock = (size: number) => {
  const length = MutableState.of(size);

  const block: IBlockState<HastRoot> = {
    value: ReactiveState.of({ type: 'root', children: [] }),
    length,
    baseLength: length,
    range: ReactiveState.of<IRangeState | null>(null),
    meta: ReactiveState.of<IBlockMeta>({
      key: 'block',
      sourceText: '',
      charStart: 0,
      charEnd: size,
      currentIndex: 0,
      blockCount: 1,
    }),
    fork: () => block,
    destroy: () => length.destroy(),
  };

  return { block, length };
};

const createProgress = (
  source: IReactiveState<IBlockState<HastRoot>[]> | IReadableClosure<IBlockState<HastRoot>[]>,
) => {
  return render(
    S([ShadProgress, { source, enabled: ReactiveState.of(true), length: ReactiveState.of(2) }]),
  );
};

const setup = (blocks: IBlockState<HastRoot>[]) => {
  const source = MutableState.of(blocks);

  const state = createProgress(source);

  return { source, state };
};

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();

  jest.useRealTimers();
});

describe('ShadProgress', () => {
  test('acquires the initial tail state before reading the visible length', () => {
    const tail = createBlock(1);

    const later = MutableState.of(1);

    const readLength = jest.fn().mockReturnValueOnce(tail.length).mockReturnValue(later);

    Object.defineProperty(tail.block, 'length', { get: readLength });

    const initialSubscribe = jest.spyOn(tail.length, 'subscribe');

    const laterSubscribe = jest.spyOn(later, 'subscribe');

    const { source, state } = setup([tail.block]);

    expect(state.value.value).toEqual({ length: 2, activeLength: 0 });

    expect(readLength).toHaveBeenCalledTimes(2);

    expect(initialSubscribe).toHaveBeenCalledTimes(1);

    expect(laterSubscribe).not.toHaveBeenCalled();

    state.destroy();

    source.destroy();

    tail.block.destroy();

    later.destroy();
  });

  test('does not reacquire the tail when a custom source repeats the same array', () => {
    const tail = createBlock(1);

    const readLength = jest.fn(() => tail.length);

    Object.defineProperty(tail.block, 'length', { get: readLength });

    const blocks = [tail.block];

    const source = new MutableState({ initial: blocks, distinctor: () => false });

    const state = createProgress({ value: source, destroy() {} });

    expect(state.value.value).toEqual({ length: 2, activeLength: 0 });

    readLength.mockClear();

    source.next(blocks);

    expect(readLength).not.toHaveBeenCalled();

    expect(state.value.value).toEqual({ length: 2, activeLength: 0 });

    state.destroy();

    source.destroy();

    tail.block.destroy();
  });

  test('retains the tail length subscription when the containing list changes', () => {
    const first = createBlock(1);

    const tail = createBlock(2);

    const subscribe = jest.spyOn(tail.length, 'subscribe');

    const { source, state } = setup([first.block, tail.block]);

    expect(state.value.value).toEqual({ length: 2, activeLength: 0 });

    expect(subscribe).toHaveBeenCalledTimes(1);

    source.next([tail.block]);

    source.next([first.block, tail.block]);

    source.next([first.block, tail.block]);

    tail.length.next(3);

    expect(state.value.value).toEqual({ length: 2, activeLength: 2 });

    expect(subscribe).toHaveBeenCalledTimes(1);

    state.destroy();

    expect(source.closed).toBe(false);

    expect(tail.length.closed).toBe(false);

    source.destroy();

    first.block.destroy();

    tail.block.destroy();
  });

  test('follows a replacement length state on the same custom block', () => {
    const tail = createBlock(1);

    let length = tail.length;

    const readLength = jest.fn(() => length);

    Object.defineProperty(tail.block, 'length', { get: readLength });

    const { source, state } = setup([tail.block]);

    expect(state.value.value).toEqual({ length: 2, activeLength: 0 });

    const replacement = MutableState.of(2);

    length = replacement;

    readLength.mockClear();

    source.next([tail.block]);

    expect(state.value.value).toEqual({ length: 2, activeLength: 1 });

    expect(readLength).toHaveBeenCalledTimes(2);

    jest.runOnlyPendingTimers();

    tail.length.next(9);

    expect(state.value.value).toEqual({ length: 2, activeLength: 0 });

    replacement.next(3);

    expect(state.value.value).toEqual({ length: 2, activeLength: 1 });

    state.destroy();

    source.destroy();

    tail.block.destroy();

    replacement.destroy();
  });

  test('releases removed tails and resumes from an empty list', () => {
    const first = createBlock(1);

    const second = createBlock(2);

    const { source, state } = setup([]);

    expect(state.value.value).toEqual({ length: 2, activeLength: 0 });

    source.next([]);

    source.next([]);

    expect(state.value.value).toEqual({ length: 2, activeLength: 0 });

    source.next([first.block]);

    expect(state.value.value).toEqual({ length: 2, activeLength: 1 });

    source.next([]);

    expect(state.value.value).toEqual({ length: 2, activeLength: 0 });

    first.length.error(new Error('Removed tail failed.'));

    expect(state.value.closed).toBe(false);

    source.next([second.block]);

    expect(state.value.value).toEqual({ length: 2, activeLength: 2 });

    state.destroy();

    source.destroy();

    first.block.destroy();

    second.block.destroy();
  });
});

describe('ShadProgress tail lifecycle', () => {
  test.each([false, true])('keeps tail getter errors terminal with batch=%s', (batched) => {
    const tail = createBlock(1);

    const readLength = jest.fn(() => tail.length);

    Object.defineProperty(tail.block, 'length', { get: readLength });

    const { source, state } = setup([tail.block]);

    const errors: unknown[] = [];

    state.value.subscribe({ error: (error) => errors.push(error) });

    const error = new Error('Tail getter failed.');

    readLength.mockImplementationOnce(() => {
      throw error;
    });

    const update = () => source.next([tail.block]);

    expect(() => (batched ? batch(update) : update())).not.toThrow();

    expect(errors).toEqual([error]);

    expect(state.value.closed).toBe(true);

    expect(() => state.value.value).toThrow(error);

    readLength.mockClear();

    source.next([tail.block]);

    expect(readLength).not.toHaveBeenCalled();

    state.destroy();

    source.destroy();

    tail.block.destroy();
  });

  test('stops reading the tail after its state errors', () => {
    const tail = createBlock(1);

    const readLength = jest.fn(() => tail.length);

    Object.defineProperty(tail.block, 'length', { get: readLength });

    const { source, state } = setup([tail.block]);

    const errors: unknown[] = [];

    state.value.subscribe({ error: (error) => errors.push(error) });

    const error = new Error('Tail state failed.');

    tail.length.error(error);

    expect(errors).toEqual([error]);

    readLength.mockClear();

    source.next([tail.block]);

    expect(readLength).not.toHaveBeenCalled();

    expect(() => state.value.value).toThrow(error);

    state.destroy();

    source.destroy();

    tail.block.destroy();
  });

  test('retains a completed tail until another tail replaces it', () => {
    const first = createBlock(1);

    const second = createBlock(2);

    const subscribe = jest.spyOn(first.length, 'subscribe');

    const { source, state } = setup([first.block]);

    expect(state.value.value).toEqual({ length: 2, activeLength: 0 });

    first.length.complete();

    source.next([first.block]);

    source.next([first.block]);

    expect(state.value.closed).toBe(false);

    expect(state.value.value).toEqual({ length: 2, activeLength: 0 });

    expect(subscribe).toHaveBeenCalledTimes(1);

    source.next([second.block]);

    second.length.next(3);

    expect(state.value.value).toEqual({ length: 2, activeLength: 2 });

    state.destroy();

    source.destroy();

    first.block.destroy();

    second.block.destroy();
  });
});
