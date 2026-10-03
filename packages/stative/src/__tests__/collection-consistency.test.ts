import {
  batch,
  combineMapClosure,
  type IReadableClosure,
  mapClosure,
  mapEachClosure,
  mapState,
  MutableState,
} from '..';

describe('collection consistency', () => {
  test.each([
    { configFirst: false, changeConfig: false },
    { configFirst: false, changeConfig: true },
    { configFirst: true, changeConfig: true },
  ])(
    'settles a deep child read during upstream publication: %j',
    ({ configFirst, changeConfig }) => {
      const raw = MutableState.of([1]);

      const scale = MutableState.of(2);

      const source = mapState(raw, (items) => [...items]);

      let child: IReadableClosure<number> | undefined;

      const collection = mapEachClosure(source, (item) => {
        const scaled = combineMapClosure([item, scale], ([value, factor]) => value * factor);

        child = mapClosure(scaled, (value) => value);

        return child;
      });

      const collectionNext = jest.fn();

      collection.value.subscribe(collectionNext);

      const next = jest.fn();

      child!.value.subscribe(next);

      next.mockClear();

      collectionNext.mockClear();

      const reads: number[] = [];

      const reader = raw.subscribe((items) => {
        if (items[0] === 2) {
          reads.push(child!.value.value);
        }
      });

      batch(() => {
        if (configFirst && changeConfig) {
          scale.next(3);
        }

        raw.next([2]);

        if (!configFirst && changeConfig) {
          scale.next(3);
        }
      });

      const expected = changeConfig ? 6 : 4;

      expect(reads).toEqual([expected]);

      expect(next.mock.calls).toEqual([[expected]]);

      expect(collectionNext.mock.calls).toEqual([[[expected]]]);

      expect(collection.value.value).toEqual([expected]);

      reader.unsubscribe();

      collection.destroy();

      source.destroy();

      raw.destroy();

      scale.destroy();
    },
  );

  test('keeps an unrelated collection failure out of a scalar read', () => {
    const failure = new Error('Unrelated collection comparison failed.');

    let comparisons = 0;

    const source = new MutableState({
      initial: [1],
      distinctor: (previous, value) => {
        comparisons += 1;

        if (comparisons === 2) {
          throw failure;
        }

        return Object.is(previous, value);
      },
    });

    const collection = mapEachClosure(source, (item) => mapClosure(item, (value) => value));

    collection.value.subscribe({ error: jest.fn() });

    const scalar = MutableState.of(0);

    const reads: number[] = [];

    let localError: unknown;

    scalar.subscribe((value) => {
      if (value !== 1) {
        return;
      }

      source.next([2]);

      try {
        reads.push(scalar.value);
      } catch (error) {
        localError = error;
      }
    });

    expect(() => scalar.next(1)).toThrow(failure);

    expect(reads).toEqual([1]);

    expect(localError).toBeUndefined();

    scalar.destroy();

    collection.destroy();

    source.destroy();
  });
});
