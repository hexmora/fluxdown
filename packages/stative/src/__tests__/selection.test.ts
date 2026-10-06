import {
  batch,
  combineMapState,
  mapClosure,
  mapState,
  MutableState,
  once,
  render,
  S,
  selectClosure,
  selectState,
  useSelect,
} from '..';

describe('shared selections', () => {
  test('keeps mapping, comparison, and terminal notifications equivalent to mapping', () => {
    const run = (select: typeof mapState) => {
      const input = MutableState.of([1]);

      const events: unknown[] = [];

      const output = select<typeof input, { count: number }>(
        input,
        (values, previous) => {
          events.push(['map', [...values], previous?.[0], previous?.[1]]);

          return { count: values.length };
        },
        (previous, current) => previous.count === current.count,
      );

      output.subscribe({
        next: (value) => events.push(['next', value]),
        complete: () => events.push(['complete']),
      });

      input.next([2]);

      batch(() => {
        input.next([2, 3]);

        input.next([2, 3, 4]);
      });

      batch(() => {
        input.next([5]);

        input.complete();
      });

      events.push(['final', output.value, output.closed]);

      output.destroy();

      input.destroy();

      return events;
    };

    expect(run(selectState)).toEqual(run(mapState));
  });

  test.each([false, true])(
    'settles cached descendants with shared configuration: %s',
    (configFirst) => {
      const input = MutableState.of([1]);

      const source = mapState(input, (values) => [...values]);

      const count = selectState(source, (values) => values.length);

      const factor = MutableState.of(2);

      const computed = combineMapState([count, factor], ([length, scale]) => length * scale);

      const cached = mapState(computed, (value) => value + 1);

      const values: number[] = [];

      cached.subscribe((value) => values.push(value));

      const reads: number[] = [];

      input.subscribe((value) => {
        if (value.length === 2) {
          reads.push(cached.value);
        }
      });

      batch(() => {
        if (configFirst) {
          factor.next(3);
        }

        input.next([1, 2]);

        if (!configFirst) {
          factor.next(3);
        }
      });

      expect(reads).toEqual([7]);

      expect(values).toEqual([3, 7]);

      cached.destroy();

      computed.destroy();

      count.destroy();

      source.destroy();

      input.destroy();

      factor.destroy();
    },
  );

  test('keeps selected closures and hooks within their descriptor ownership', () => {
    const input = MutableState.of([1]);

    const count = selectClosure(input, (values) => values.length);

    const child = mapClosure(count, (length) => length * 2);

    const View = once(() => useSelect(child, (value) => value + 1));

    const view = render(S([View, {}]));

    const output = view.value;

    expect(output.value).toBe(3);

    input.next([1, 2]);

    expect(output.value).toBe(5);

    const countState = count.value;

    const childState = child.value;

    view.destroy();

    expect(countState.closed).toBe(true);

    expect(childState.closed).toBe(true);

    expect(input.closed).toBe(false);

    input.destroy();
  });
});
