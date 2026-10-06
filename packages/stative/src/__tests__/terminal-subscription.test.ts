import { batch, mapState, MutableState, ReactiveState } from '..';

describe('terminal subscriptions', () => {
  test.each(['constant', 'complete', 'error'] as const)(
    'preserves immediate terminal delivery and reentrant reads: %s',
    (terminal) => {
      const input = MutableState.of(1);

      const source = terminal === 'constant' ? ReactiveState.of(1) : input;

      const failure = new Error('Source failed.');

      if (terminal === 'complete') {
        input.complete();
      } else if (terminal === 'error') {
        input.error(failure);
      }

      const config = MutableState.of(2);

      const sibling = mapState(config, (value) => value * 10);

      const reads: number[] = [];

      const output = new ReactiveState({
        initial: -1,
        emitter: (observer) =>
          source.subscribe({
            next: observer.next.bind(observer),
            complete: () => {
              config.next(3);

              reads.push(sibling.value);

              observer.complete();
            },
            error: (error) => {
              config.next(3);

              reads.push(sibling.value);

              observer.error(error);
            },
          }),
      });

      const values: number[] = [];

      const completed = jest.fn();

      const failed = jest.fn();

      output.subscribe({ next: (value) => values.push(value), complete: completed, error: failed });

      expect(values).toEqual([]);

      expect(reads).toEqual([30]);

      expect(output.closed).toBe(true);

      if (terminal === 'error') {
        expect(failed).toHaveBeenCalledWith(failure);

        expect(() => output.value).toThrow(failure);
      } else {
        expect(completed).toHaveBeenCalledTimes(1);

        expect(output.value).toBe(-1);
      }

      output.destroy();

      sibling.destroy();

      config.destroy();

      source.destroy();

      input.destroy();
    },
  );

  test.each(['complete', 'error'] as const)(
    'keeps pending terminal sources connected until publication: %s',
    (terminal) => {
      const source = MutableState.of(1);

      const failure = new Error('Pending source failed.');

      const events: unknown[] = [];

      const output = new ReactiveState({
        initial: -1,
        emitter: (observer) => source.subscribe(observer),
      });

      batch(() => {
        source.next(2);

        if (terminal === 'error') {
          source.error(failure);
        } else {
          source.complete();
        }

        output.subscribe({
          next: (value) => events.push(value),
          complete: () => events.push('complete'),
          error: (error) => events.push(error),
        });

        expect(output.value).toBe(1);

        expect(output.closed).toBe(false);
      });

      expect(events).toEqual([-1, 2, terminal === 'error' ? failure : 'complete']);

      expect(output.closed).toBe(true);

      if (terminal === 'error') {
        expect(() => output.value).toThrow(failure);
      } else {
        expect(output.value).toBe(2);
      }

      output.destroy();

      source.destroy();
    },
  );

  test.each(['complete', 'error'] as const)(
    'settles a pending terminal source through a reentrant derived read: %s',
    (terminal) => {
      const source = MutableState.of(1);

      const trigger = MutableState.of(false);

      const failure = new Error('Pending source failed.');

      const output = new ReactiveState({
        initial: -1,
        emitter: (observer) => source.subscribe(observer),
      });

      const reads: unknown[] = [];

      trigger.subscribe((active) => {
        if (!active) {
          return;
        }

        try {
          reads.push(output.value);
        } catch (error) {
          reads.push(error);
        }

        reads.push(output.closed);
      });

      batch(() => {
        trigger.next(true);

        source.next(2);

        if (terminal === 'error') {
          source.error(failure);
        } else {
          source.complete();
        }
      });

      expect(reads).toEqual([terminal === 'error' ? failure : 2, true]);

      output.destroy();

      trigger.destroy();

      source.destroy();
    },
  );
});
