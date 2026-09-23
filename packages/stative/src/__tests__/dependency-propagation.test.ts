import { BehaviorSubject, type Subscription } from 'rxjs';

import {
  batch,
  combineMapState,
  mapState,
  MutableState,
  ReactiveState,
  switchMapClosure,
} from '..';

describe('dependency propagation', () => {
  test('uses the settled source when a batch activates a lazy mapped branch', () => {
    const selected = MutableState.of(false);
    const first = MutableState.of(1);
    const second = MutableState.of(2);
    const head = mapState(second, (value) => value * 2);
    const mapper = jest.fn(
      (value: number, previous: [number, number] | null) => value + (previous?.[1] ?? 0),
    );
    const tail = mapState(head, mapper);
    const output = switchMapClosure(selected, (value) => (value ? tail : first));
    const next = jest.fn();
    const outputState = output.value;
    const subscription = outputState.subscribe(next);

    mapper.mockClear();
    next.mockClear();

    batch(() => {
      selected.next(true);
      first.next(9);
      second.next(3);
    });

    expect(mapper).toHaveBeenCalledTimes(1);
    expect(mapper).toHaveBeenCalledWith(6, [4, 4]);
    expect(outputState.value).toBe(10);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(10);

    subscription.unsubscribe();
    output.destroy();
    tail.destroy();
    head.destroy();
    selected.destroy();
    first.destroy();
    second.destroy();
  });

  describe.each([
    { terminal: 'complete', error: undefined },
    { terminal: 'error', error: new Error('source failed') },
    { terminal: 'error without a reason', error: undefined },
  ])('$terminal during lazy subscription', ({ terminal, error }) => {
    test.each(['pending', 'setup', 'reentrant'] as const)(
      'delivers the final value before a terminal event from %s',
      (timing) => {
        const trigger = MutableState.of(false);
        const source = new MutableState({
          initial: 0,
          emitter: (observer) => {
            if (timing === 'setup') {
              observer.next(1);

              if (terminal === 'complete') {
                observer.complete();
              } else {
                observer.error(error);
              }
            }
          },
        });
        const finish = () => {
          if (terminal === 'complete') {
            source.complete();
          } else {
            source.error(error);
          }
        };
        const mapped = timing === 'setup' ? source : mapState(source, (value) => value * 2);
        const events: unknown[] = [];
        const observer = {
          next: (value: number) => events.push(['next', value]),
          complete: () => events.push(['complete']),
          error: (reason: unknown) => events.push(['error', reason]),
        };
        let subscription: Subscription | undefined;

        if (timing === 'reentrant') {
          source.subscribe({
            next: (value) => {
              if (value === 1) {
                finish();
              }
            },
            error: jest.fn(),
          });
        }

        trigger.subscribe((value) => {
          if (value) {
            subscription = mapped.subscribe(observer);
          }
        });

        batch(() => {
          trigger.next(true);

          if (timing !== 'setup') {
            source.next(1);
          }

          if (timing === 'pending') {
            finish();
          }
        });

        const finalEvent = terminal === 'complete' ? ['complete'] : ['error', error];

        expect(events).toEqual([['next', timing === 'setup' ? 1 : 2], finalEvent]);
        expect(subscription?.closed).toBe(true);

        events.length = 0;
        mapped.subscribe(observer);

        expect(events).toEqual([finalEvent]);

        mapped.destroy();
        source.destroy();
        trigger.destroy();
      },
    );
  });

  test('forwards reentrant updates and unsubscribes after a lazy subscription settles', () => {
    const trigger = MutableState.of(false);
    const source = MutableState.of(0);
    const mapped = mapState(source, (value) => value * 2);
    const values: number[] = [];
    let subscription: Subscription | undefined;

    trigger.subscribe((value) => {
      if (value) {
        subscription = mapped.subscribe((current) => {
          values.push(current);

          if (current === 2) {
            source.next(2);
          }
        });
      }
    });

    batch(() => {
      trigger.next(true);
      source.next(1);
    });

    expect(values).toEqual([2, 4]);

    subscription?.unsubscribe();
    source.next(3);

    expect(values).toEqual([2, 4]);

    mapped.destroy();
    source.destroy();
    trigger.destroy();
  });

  test('preserves final delivery and batch errors when lazy settlement encounters a throwing cleanup', () => {
    const failure = new Error('cleanup failed');
    const trigger = MutableState.of(false);
    const waiting = MutableState.of(0);
    const source = new MutableState({
      initial: 0,
      emitter: () => () => {
        throw failure;
      },
    });
    const mapped = mapState(source, (value) => value * 2);
    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn();
    const waitingNext = jest.fn();
    let subscription: Subscription | undefined;

    waiting.subscribe(waitingNext);
    waitingNext.mockClear();
    trigger.subscribe((value) => {
      if (value) {
        subscription = mapped.subscribe({ next, complete, error });
      }
    });

    expect(() => {
      batch(() => {
        trigger.next(true);
        source.next(1);
        source.complete();
        waiting.next(1);
      });
    }).toThrow('cleanup failed');

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(2);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).not.toHaveBeenCalled();
    expect(mapped.value).toBe(2);
    expect(subscription?.closed).toBe(true);
    expect(waitingNext).toHaveBeenCalledTimes(1);
    expect(waitingNext).toHaveBeenCalledWith(1);

    mapped.destroy();
    source.destroy();
    trigger.destroy();
    waiting.destroy();
  });

  test('keeps an explicit batch pending when it adds a subscriber', () => {
    const source = MutableState.of(0);
    const existing = jest.fn();
    const added = jest.fn();
    const subscription = source.subscribe(existing);

    existing.mockClear();

    batch(() => {
      source.next(1);
      source.subscribe(added);

      expect(existing).not.toHaveBeenCalled();
      expect(added).toHaveBeenCalledTimes(1);
      expect(added).toHaveBeenCalledWith(0);
    });

    expect(existing).toHaveBeenCalledWith(1);
    expect(added).toHaveBeenNthCalledWith(2, 1);

    subscription.unsubscribe();
    source.destroy();
  });

  test.each(['destroy', 'complete'] as const)(
    'releases a state when %s encounters a throwing cleanup',
    (operation) => {
      const source = MutableState.of(0);
      const output = new MutableState({
        initial: 0,
        emitter: (observer) => {
          const subscription = source.subscribe(observer);

          return () => {
            subscription.unsubscribe();

            throw new Error('cleanup failed');
          };
        },
      });
      const next = jest.fn();
      const subscription = output.subscribe(next);

      next.mockClear();

      expect(() => output[operation]()).toThrow('cleanup failed');
      expect(output.closed).toBe(true);
      expect(subscription.closed).toBe(true);

      source.next(1);

      expect(next).not.toHaveBeenCalled();

      source.destroy();
    },
  );

  test('drains a waiting update when settling its dependency throws', () => {
    const failure = new Error('comparison failed');
    let comparisons = 0;
    const source = new MutableState({
      initial: 0,
      distinctor: (previous, current) => {
        comparisons += 1;

        if (comparisons === 2) {
          throw failure;
        }

        return Object.is(previous, current);
      },
    });
    const trigger = new BehaviorSubject(0);
    const output = new ReactiveState({
      initial: 0,
      emitter: (observer) => {
        const dependency = source.subscribe({});
        const updates = trigger.subscribe((value) => observer.next(value));

        return () => {
          dependency.unsubscribe();
          updates.unsubscribe();
        };
      },
    });
    const next = jest.fn();

    output.subscribe(next);
    next.mockClear();

    expect(() => {
      batch(() => {
        trigger.next(1);
        source.next(1);
      });
    }).toThrow(failure);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(1);

    output.destroy();
    source.destroy();
    trigger.complete();
  });

  test('rechecks an earlier dependency after a sibling subscriber writes to it', () => {
    const left = MutableState.of(1);
    const right = MutableState.of(1);
    const mappedLeft = mapState(left, (value) => value * 10);
    const mappedRight = mapState(right, (value) => value * 100);
    const mapper = jest.fn(([a, b]: [number, number]) => [a, b]);
    const joined = combineMapState([mappedLeft, mappedRight], mapper);
    const next = jest.fn();

    joined.subscribe(next);
    const reentrant = mappedRight.subscribe((value) => {
      if (value === 300) {
        left.next(10);
      }
    });
    mapper.mockClear();
    next.mockClear();

    batch(() => {
      left.next(2);
      right.next(3);
    });

    expect(mapper).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith([100, 300]);

    reentrant.unsubscribe();
    joined.destroy();
    mappedLeft.destroy();
    mappedRight.destroy();
    left.destroy();
    right.destroy();
  });

  test('retains a dependency until its last subscription is removed', () => {
    const source = MutableState.of(1);
    const head = mapState(source, (value) => value + 1);
    const deep = mapState(head, (value) => value * 10);
    const forward = jest.fn();
    const cleanup = jest.fn();
    let first: Subscription | undefined;
    let second: Subscription | undefined;
    const repeated = new ReactiveState({
      initial: deep.value,
      emitter: (observer) => {
        first = deep.subscribe({});
        second = deep.subscribe((value) => {
          forward(value);
          observer.next(value);
        });

        return () => {
          first?.unsubscribe();
          second?.unsubscribe();
          cleanup();
        };
      },
    });
    const joined = combineMapState([source, repeated], ([value, derived]) => [value, derived]);
    const next = jest.fn();

    joined.subscribe(next);
    first?.unsubscribe();
    next.mockClear();

    source.next(2);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith([2, 30]);
    expect(second?.closed).toBe(false);

    joined.destroy();
    repeated.destroy();
    forward.mockClear();
    source.next(3);

    expect(first?.closed).toBe(true);
    expect(second?.closed).toBe(true);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(forward).not.toHaveBeenCalled();

    deep.destroy();
    head.destroy();
    source.destroy();
  });

  test('tracks subscriptions created by a custom emitter after a source change', () => {
    const selected = MutableState.of(false);
    const firstSource = MutableState.of(1);
    const secondSource = MutableState.of(2);
    const head = mapState(secondSource, (value) => value * 2);
    const second = mapState(head, (value) => value + 1);
    const output = new ReactiveState({
      initial: firstSource.value,
      emitter: (observer) => {
        let inner: Subscription | undefined;
        const outer = selected.subscribe((value) => {
          inner?.unsubscribe();
          inner = (value ? second : firstSource).subscribe((current) => observer.next(current));
        });

        return () => {
          outer.unsubscribe();
          inner?.unsubscribe();
        };
      },
    });
    const next = jest.fn();

    output.subscribe(next);
    next.mockClear();

    batch(() => {
      selected.next(true);
      secondSource.next(3);
    });

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(7);

    firstSource.next(100);

    expect(next).toHaveBeenCalledTimes(1);

    output.destroy();
    secondSource.next(4);

    expect(next).toHaveBeenCalledTimes(1);

    second.destroy();
    head.destroy();
    selected.destroy();
    firstSource.destroy();
    secondSource.destroy();
  });

  test('settles a nested state read by an outer value subscriber', () => {
    const source = MutableState.of(1);
    const head = mapState(source, (value) => value + 1);
    const middle = mapState(head, (value) => value + 1);
    const metadata = mapState(middle, (value) => value + 1);
    const output = mapState(source, (value) => ({ value, metadata }));
    const snapshots: Array<[number, number]> = [];

    output.subscribe(({ value, metadata: currentMetadata }) => {
      snapshots.push([value, currentMetadata.value]);
    });
    snapshots.splice(0);

    source.next(2);

    expect(snapshots).toEqual([[2, 5]]);

    output.destroy();
    metadata.destroy();
    middle.destroy();
    head.destroy();
    source.destroy();
  });
});
