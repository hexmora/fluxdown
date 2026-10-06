import { BehaviorSubject } from 'rxjs';

import type { IReadableClosure } from '../../../../index';

import {
  batch,
  combineMapClosure,
  mapClosure,
  mapState,
  MutableState,
  once,
  ReactiveState,
  render,
  S,
  useClearable,
  useMapKeyed,
} from '../../../../index';
import { mapKeyedClosure } from '../keyed';

const createItem = (value: number) => ({ state: MutableState.of(value) });

describe('mapKeyedClosure', () => {
  test('retains children across reorders and shares duplicate identities', () => {
    const first = createItem(1);

    const second = createItem(2);

    const source = MutableState.of([first, second, first]);

    const mapper = jest.fn((item: ReturnType<typeof createItem>) =>
      mapClosure(item.state, (value) => value * 2),
    );

    const closure = mapKeyedClosure(source, mapper);

    expect(closure.value.value).toEqual([2, 4, 2]);

    expect(mapper).toHaveBeenCalledTimes(2);

    source.next([second, first]);

    first.state.next(3);

    expect(closure.value.value).toEqual([4, 6]);

    expect(mapper).toHaveBeenCalledTimes(2);

    source.next([first, first]);

    second.state.next(9);

    expect(closure.value.value).toEqual([6, 6]);

    source.next([second, first]);

    expect(closure.value.value).toEqual([18, 6]);

    expect(mapper).toHaveBeenCalledTimes(3);

    closure.destroy();

    expect(source.closed).toBe(false);

    expect(first.state.closed).toBe(false);

    source.destroy();

    first.state.destroy();

    second.state.destroy();
  });

  test('retains subscriptions without replaying unchanged children', () => {
    const first = createItem(1);

    const second = createItem(2);

    const child = mapClosure(first.state, (value) => value);

    const subscribe = jest.spyOn(child.value, 'subscribe');

    const source = MutableState.of([first]);

    const closure = mapKeyedClosure(source, (item) =>
      item === first ? child : mapClosure(item.state, (value) => value),
    );

    expect(closure.value.value).toEqual([1]);

    expect(subscribe).toHaveBeenCalledTimes(1);

    source.next([first, second]);

    source.next([second, first, first]);

    source.next([first]);

    expect(closure.value.value).toEqual([1]);

    expect(subscribe).toHaveBeenCalledTimes(1);

    closure.destroy();

    source.destroy();

    first.state.destroy();

    second.state.destroy();
  });

  test('publishes one aggregate for batched list and child updates', () => {
    const first = createItem(1);

    const second = createItem(2);

    const factor = MutableState.of(2);

    const source = MutableState.of([first]);

    const closure = mapKeyedClosure(source, (item) =>
      combineMapClosure([item.state, factor], ([value, scale]) => value * scale),
    );

    const values: number[][] = [];

    closure.value.subscribe((value) => values.push(value));

    batch(() => {
      source.next([second, first]);

      first.state.next(3);

      factor.next(4);
    });

    expect(values).toEqual([[2], [8, 12]]);

    closure.destroy();

    source.destroy();

    first.state.destroy();

    second.state.destroy();

    factor.destroy();
  });

  test('waits for retained children after source completion', () => {
    const item = createItem(1);

    const source = MutableState.of([item]);

    const closure = mapKeyedClosure(source, (current) =>
      mapClosure(current.state, (value) => value),
    );

    const values: number[][] = [];

    const complete = jest.fn();

    closure.value.subscribe({ next: (value) => values.push(value), complete });

    source.complete();

    item.state.next(2);

    expect(values).toEqual([[1], [2]]);

    expect(complete).not.toHaveBeenCalled();

    item.state.complete();

    expect(complete).toHaveBeenCalledTimes(1);

    expect(closure.value.value).toEqual([2]);

    closure.destroy();
  });

  test('forwards undefined errors and releases all child observations', () => {
    const first = createItem(1);

    const second = createItem(2);

    const source = MutableState.of([first, second]);

    const child = mapClosure(second.state, (value) => value);

    const closure = mapKeyedClosure(source, (item) =>
      item === second ? child : mapClosure(item.state, (value) => value),
    );

    const error = jest.fn();

    closure.value.subscribe({ error });

    first.state.error(undefined);

    expect(error.mock.calls).toEqual([[undefined]]);

    expect(child.value.closed).toBe(true);

    expect(second.state.closed).toBe(false);

    expect(source.closed).toBe(false);

    closure.destroy();

    source.destroy();

    second.state.destroy();
  });

  test('acquires shared children before removed identities release ownership', () => {
    const input = MutableState.of(1);

    const child = mapClosure(input, (value) => value * 2);

    const source = MutableState.of(['first']);

    const closure = mapKeyedClosure(source, () => child);

    expect(closure.value.value).toEqual([2]);

    source.next(['replacement']);

    input.next(2);

    expect(child.value.closed).toBe(false);

    expect(closure.value.value).toEqual([4]);

    closure.destroy();

    expect(child.value.closed).toBe(true);

    input.destroy();

    source.destroy();
  });

  test('cleans up all newly created children when construction fails', () => {
    const input = MutableState.of(1);

    const source = MutableState.of([1]);

    const children: ReturnType<typeof mapClosure>[] = [];

    const closure = mapKeyedClosure(source, (item) => {
      if (item === 3) {
        throw new Error('Cannot build this item.');
      }

      const child = mapClosure(input, (value) => value * item);

      children.push(child);

      return child;
    });

    const error = jest.fn();

    closure.value.subscribe({ error });

    source.next([1, 2, 3]);

    expect(error).toHaveBeenCalledTimes(1);

    expect(children.every((child) => child.value.closed)).toBe(true);

    expect(input.closed).toBe(false);

    closure.destroy();

    source.destroy();

    input.destroy();
  });

  test('supports raw BehaviorSubject lists and SameValueZero keys', () => {
    const source = new BehaviorSubject([NaN, NaN, -0, 0]);

    const mapper = jest.fn((value: number) => ReactiveState.of(value));

    const closure = mapKeyedClosure(source, mapper);

    expect(closure.value.value).toEqual([NaN, NaN, -0, -0]);

    expect(mapper).toHaveBeenCalledTimes(2);

    source.next([0, NaN]);

    expect(closure.value.value).toEqual([-0, NaN]);

    expect(mapper).toHaveBeenCalledTimes(2);

    source.complete();

    expect(closure.value.closed).toBe(true);

    closure.destroy();
  });

  test('settles membership before cached child and external derived reads', () => {
    const item = createItem(1);

    const source = MutableState.of([item]);

    const child = mapClosure(item.state, (value) => value);

    const closure = mapKeyedClosure(source, () => child);

    const reads: unknown[] = [];

    let armed = false;

    const external = mapState(child.value, (value) => value * 2);

    expect(closure.value.value).toEqual([1]);

    source.subscribe(() => {
      if (armed) {
        reads.push([external.value, child.value.value, child.value.closed]);
      }
    });

    expect(external.value).toBe(2);

    armed = true;

    source.next([]);

    expect(reads).toEqual([[2, 1, true]]);

    expect(closure.value.value).toEqual([]);

    closure.destroy();

    external.destroy();

    source.destroy();

    item.state.destroy();
  });

  test('keeps a shared mapped closure alive until its final keyed entry is removed', () => {
    const input = MutableState.of(1);

    const child = mapClosure(input, (value) => value * 2);

    const source = MutableState.of(['first', 'second']);

    const closure = mapKeyedClosure(source, () => child);

    expect(closure.value.value).toEqual([2, 2]);

    source.next(['second']);

    input.next(2);

    expect(closure.value.value).toEqual([4]);

    expect(child.value.closed).toBe(false);

    source.next([]);

    expect(child.value.closed).toBe(true);

    closure.destroy();

    input.destroy();

    source.destroy();
  });

  test('cleans up all children when a teardown throws', () => {
    const destroyed: number[] = [];

    const Item = once(({ value }: { value: number }) => {
      useClearable(() => {
        destroyed.push(value);

        if (value === 1) {
          throw new Error('Cannot clean up this item.');
        }
      });

      return value;
    });

    const source = MutableState.of([1, 2]);

    const closure = mapKeyedClosure(source, (value) => S([Item, { value }]));

    const error = jest.fn();

    closure.value.subscribe({ error });

    source.next([]);

    expect(error).toHaveBeenCalledTimes(1);

    expect(destroyed).toEqual([1, 2]);

    expect(closure.value.closed).toBe(true);

    closure.destroy();

    source.destroy();
  });

  test('owns keyed collections through the once hook runtime', () => {
    const source = MutableState.of([1, 2]);

    const Collection = once(({ source: items }: { source: IReadableClosure<number[]> }) =>
      useMapKeyed(items, (value) => value * 2),
    );

    const closure = render(S([Collection, { source }]));

    expect(closure.value.value).toEqual([2, 4]);

    source.next([2, 1, 2]);

    expect(closure.value.value).toEqual([4, 2, 4]);

    closure.destroy();

    expect(source.closed).toBe(false);

    source.destroy();
  });

  test('owns mapper descriptors through the existing runtime', () => {
    const source = MutableState.of([1, 2]);

    const Item = once(({ value }: { value: number }) => value * 2);

    const closure = mapKeyedClosure(source, (value) => S([Item, { value }]));

    expect(closure.value.value).toEqual([2, 4]);

    source.next([2, 1]);

    expect(closure.value.value).toEqual([4, 2]);

    closure.destroy();

    expect(source.closed).toBe(false);

    source.destroy();
  });
});
