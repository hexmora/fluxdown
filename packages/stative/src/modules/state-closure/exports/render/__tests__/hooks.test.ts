import { expectTypeOf } from 'expect-type';

import {
  type FlattenedState,
  type IReadableClosure,
  mapClosure,
  MutableState,
  renderHooks,
  S,
  useClearable,
  useFlatten,
  useMap,
  useRef,
} from '../../../../..';

describe('renderHooks', () => {
  test('runs once lazily and leaves unused callbacks uninitialized', () => {
    const source = MutableState.of({ count: 1 });

    const callback = jest.fn(() => useFlatten(source));

    const first = renderHooks(callback);

    const second = renderHooks(callback);

    const unused = renderHooks(callback);

    expectTypeOf(first).toEqualTypeOf<IReadableClosure<FlattenedState<{ count: number }>>>();

    expect(callback).not.toHaveBeenCalled();

    const fields = first.value.value;

    expect(fields.count.value.value).toBe(1);

    expect(first.value.value).toBe(fields);

    source.next({ count: 2 });

    expect(fields.count.value.value).toBe(2);

    expect(callback).toHaveBeenCalledTimes(1);

    expect(second.value.value).not.toBe(fields);

    expect(callback).toHaveBeenCalledTimes(2);

    first.destroy();

    second.destroy();

    unused.destroy();

    expect(callback).toHaveBeenCalledTimes(2);

    expect(source.closed).toBe(false);

    source.destroy();
  });

  test('keeps hook-created fields alive between consumers and releases them with their owner', () => {
    const source = MutableState.of({ count: 1 });

    const owner = renderHooks(() => useFlatten(source));

    const fields = owner.value.value;

    const previous = mapClosure(fields.count, (count) => count);

    expect(previous.value.value).toBe(1);

    previous.destroy();

    expect(fields.count.value.closed).toBe(false);

    source.next({ count: 2 });

    const replacement = mapClosure(fields.count, (count) => count);

    expect(replacement.value.value).toBe(2);

    const cleanup = jest.spyOn(fields.count, 'destroy');

    replacement.destroy();

    owner.destroy();

    owner.destroy();

    expect(cleanup).toHaveBeenCalledTimes(1);

    expect(fields.count.value.closed).toBe(true);

    expect(source.closed).toBe(false);

    source.destroy();
  });

  test('preserves returned values without resolving or owning their contents', () => {
    const source = MutableState.of(1);

    const child = mapClosure(source, (value) => value * 2);

    const descriptor = S([(value: number) => value * 3, source]);

    const result = { source, child, descriptor };

    const owner = renderHooks(() => result);

    expect(owner.value.value).toBe(result);

    expect(owner.value.value.child).toBe(child);

    owner.destroy();

    source.next(2);

    expect(child.value.value).toBe(4);

    child.destroy();

    source.destroy();
  });

  test('cleans up initialized hooks after a callback throws', () => {
    const source = MutableState.of(1);

    const cleanup = jest.fn();

    let mapped: IReadableClosure<number>;

    const owner = renderHooks(() => {
      useClearable(cleanup);

      mapped = useMap(source, (value) => value * 2);

      expect(mapped.value.value).toBe(2);

      throw new Error('setup failed');
    });

    expect(() => owner.value).toThrow('setup failed');

    expect(cleanup).toHaveBeenCalledTimes(1);

    expect(mapped!.value.closed).toBe(true);

    expect(source.closed).toBe(false);

    owner.destroy();

    expect(cleanup).toHaveBeenCalledTimes(1);

    source.destroy();
  });

  test('restores the parent hook scope after reading a nested owner', () => {
    const first = jest.fn();

    const nested = jest.fn();

    const last = jest.fn();

    const owner = renderHooks(() => {
      useClearable(first);

      const child = useClearable(renderHooks(() => useClearable(nested)));

      expect(child.value.value).toBe(nested);

      useClearable(last);

      return child;
    });

    const child = owner.value.value;

    child.destroy();

    expect(nested).toHaveBeenCalledTimes(1);

    expect(first).not.toHaveBeenCalled();

    expect(last).not.toHaveBeenCalled();

    owner.destroy();

    expect(first).toHaveBeenCalledTimes(1);

    expect(last).toHaveBeenCalledTimes(1);

    expect(nested).toHaveBeenCalledTimes(1);
  });

  test('keeps mapper-only hooks unavailable in once callbacks', () => {
    const owner = renderHooks(() => useRef(1));

    expect(() => owner.value).toThrow('useRef can only be used in mapper functions');

    owner.destroy();
  });
});
