import {
  batch,
  combineMapClosure,
  type IReadableClosure,
  mapClosure,
  mapEachClosure,
  mapState,
  MutableState,
  switchMapClosure,
} from '..';

describe('collection reading', () => {
  test.each([false, true])(
    'settles a cached external descendant when configuration changes first: %s',
    (configFirst) => {
      const raw = MutableState.of([1, 2]);

      const factor = MutableState.of(2);

      const source = mapState(raw, (items) => [...items]);

      const children: IReadableClosure<number>[] = [];

      const collection = mapEachClosure(source, (item) => {
        const child = combineMapClosure([item, factor], ([value, scale]) => value * scale);

        children.push(child);

        return child;
      });

      const output = collection.value;

      output.subscribe({});

      const saved = children[1].value;

      const external = mapState(saved, (value) => value + 1);

      const next = jest.fn();

      external.subscribe(next);

      const reads: number[] = [];

      raw.subscribe((items) => {
        if (items[1] === 3) {
          reads.push(external.value);
        }
      });

      next.mockClear();

      batch(() => {
        if (configFirst) {
          factor.next(3);
        }

        raw.next([1, 3]);

        if (!configFirst) {
          factor.next(3);
        }
      });

      expect(reads).toEqual([10]);

      expect(next.mock.calls).toEqual([[10]]);

      expect(output.value).toEqual([3, 9]);

      external.destroy();

      collection.destroy();

      source.destroy();

      raw.destroy();

      factor.destroy();
    },
  );

  test('preserves aggregation while a child rewrites its inputs and reads the collection', () => {
    const source = MutableState.of([1]);

    const factor = MutableState.of(2);

    let child: IReadableClosure<number> | undefined;

    const collection = mapEachClosure(source, (item) => {
      child = combineMapClosure([item, factor], ([value, scale]) => value * scale);

      return child;
    });

    const output = collection.value;

    const values: number[][] = [];

    output.subscribe((value) => values.push([...value]));

    child!.value.subscribe((value) => {
      if (value === 6) {
        source.next([3]);

        factor.next(4);

        void output.value;
      }
    });

    batch(() => {
      source.next([2]);

      factor.next(3);
    });

    expect(values).toEqual([[2], [12]]);

    collection.destroy();

    source.destroy();

    factor.destroy();
  });

  test('settles nested collections before reading a saved descendant', () => {
    const source = MutableState.of([[1], [2]]);

    const children: IReadableClosure<number>[] = [];

    const collection = mapEachClosure(source, (items) =>
      mapEachClosure(items, (item) => {
        const child = mapClosure(item, (value) => value * 2);

        children.push(child);

        return child;
      }),
    );

    const output = collection.value;

    output.subscribe({});

    const saved = children[1].value;

    const reads: number[] = [];

    source.subscribe((items) => {
      if (items[1][0] === 3) {
        reads.push(saved.value);
      }
    });

    source.next([[1], [3]]);

    expect(reads).toEqual([6]);

    expect(output.value).toEqual([[2], [6]]);

    collection.destroy();

    source.destroy();
  });

  test('detaches collection read dependencies when switching to an independent source', () => {
    const failure = new Error('Collection publication failed.');

    let failComparison = false;

    let comparisons = 0;

    const source = new MutableState({
      initial: [1],
      distinctor: (previous, value) => {
        if (failComparison && ++comparisons === 2) {
          throw failure;
        }

        return Object.is(previous, value);
      },
    });

    const selected = MutableState.of(true);

    const independent = MutableState.of(10);

    let child: IReadableClosure<number> | undefined;

    const collection = mapEachClosure(source, (item) => {
      child = mapClosure(item, (value) => value);

      return child;
    });

    collection.value.subscribe({ error: jest.fn() });

    const switched = switchMapClosure(selected, (value) =>
      value ? child!.value : independent,
    );

    const external = mapState(switched, (value) => value + 1);

    external.subscribe({});

    selected.next(false);

    failComparison = true;

    const scalar = MutableState.of(0);

    const reads: number[] = [];

    const localErrors: unknown[] = [];

    scalar.subscribe((value) => {
      if (value !== 1) {
        return;
      }

      source.next([2]);

      try {
        reads.push(external.value);
      } catch (error) {
        localErrors.push(error);
      }
    });

    expect(() => scalar.next(1)).toThrow(failure);

    expect(reads).toEqual([11]);

    expect(localErrors).toEqual([]);

    external.destroy();

    switched.destroy();

    collection.destroy();

    source.destroy();

    selected.destroy();

    independent.destroy();

    scalar.destroy();
  });
});
