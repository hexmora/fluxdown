import { Subscription } from 'rxjs';
import { shallowEqual } from 'shallow-equal';

import type { Distinctor, IReactiveState, StateSource, StateValue } from '../../../reactive-state';
import type { IReadableClosure, ListEntry, StateClosureSource } from '../../type';
import type {
  MarkedStateClosureDescriptor,
  StateClosureResult,
  StateClosureResultNode,
  StateClosureResultValue,
} from '../render';

import { MutableState } from '../../../mutable-state';
import { isReactiveStateLike, ReactiveState, toState } from '../../../reactive-state';
import { batch } from '../../../state-graph/main';
import { StateNode } from '../../../state-graph/utils/node';
import { FactoryReadableClosure, toClosure } from '../../main';
import { StateClosureHookRuntime } from '../hooks/utils/runtime';
import { render } from '../render';
import {
  clearWithDescriptorScope,
  detachWithDescriptorScope,
  getReadableClosureScope,
  ownReadableClosure,
  releaseReadableClosure,
} from '../render/utils/context';
import { isImmediateDescriptor, isReadableClosure } from '../render/utils/predicates';

/**
 * Follows the latest mapped child and releases the previous child graph on replacement.
 * Consecutive returns of the same raw state reuse its child closure and subscription.
 * Completed flows retain the final child graph until the closure is destroyed.
 */
export function switchMapClosure<S, R>(
  source: S,
  mapper: (value: StateValue<S>) => R & StateClosureResultNode,
  distinctor?: Distinctor<StateClosureResultValue<R>>,
): IReadableClosure<StateClosureResultValue<R>>;
export function switchMapClosure<S, R>(
  source: S,
  mapper: (value: StateValue<S>) => StateClosureResult<R>,
  distinctor?: Distinctor<R>,
): IReadableClosure<R>;
export function switchMapClosure<S, R>(
  source: S,
  mapper: (value: StateValue<S>) => StateClosureResult<R>,
  distinctor?: Distinctor<R>,
): IReadableClosure<R> {
  const closure = FactoryReadableClosure.create(() => {
    const input = toState(source);

    let cached: [IReactiveState<R>, IReadableClosure<R>] | null = null;

    clearWithDescriptorScope(scope, () => {
      cached = null;
    });

    const handleCreate = (value: StateValue<S>) =>
      ownReadableClosure(
        scope,
        FactoryReadableClosure.create(() => {
          const result = StateClosureHookRuntime.run(null, () => mapper(value));

          if (!isImmediateDescriptor(result) && isReactiveStateLike<R>(result)) {
            if (cached && cached[0] === result) {
              return cached[1];
            }

            const child = render<R>(result);

            cached = [result, child];

            return child;
          }

          cached = null;

          return render<R>(result);
        }),
      );

    let previous = input.value;

    let current = handleCreate(previous);

    let inner = current.value;

    const state: ReactiveState<R> = new ReactiveState({
      initial: inner.value,

      distinctor,

      emitter: (observer) => {
        const subscriptions = new Subscription();

        let subscription: Subscription | null = null;

        let stopped = false;

        let completed = false;

        const handleError = (error: unknown) => {
          if (!stopped) {
            stopped = true;

            observer.error(error);
          }
        };

        const handleSchedule = () => {
          StateNode.get(state).schedule(handleUpdate);
        };

        const handleSubscribe = () => {
          subscription = inner.subscribe({
            next: handleSchedule,

            error: handleError,

            complete: handleSchedule,
          });
        };

        const handleUpdate = () => {
          if (stopped) {
            return;
          }

          try {
            const value = input.value;

            if (!Object.is(value, previous)) {
              const next = handleCreate(value);

              const nextState = next.value;

              subscription?.unsubscribe();

              releaseReadableClosure(scope, current);

              previous = value;

              current = next;

              inner = nextState;

              handleSubscribe();
            }

            observer.next(inner.value);

            if (input.closed && inner.closed) {
              stopped = true;

              completed = true;

              observer.complete();
            }
          } catch (error) {
            handleError(error);
          }
        };

        batch(() => {
          handleSubscribe();

          subscriptions.add(
            input.subscribe({
              next: handleSchedule,

              error: handleError,

              complete: handleSchedule,
            }),
          );
        });

        return () => {
          stopped = true;

          cached = null;

          subscriptions.unsubscribe();

          subscription?.unsubscribe();

          if (!completed) {
            releaseReadableClosure(scope, current);
          }
        };
      },
    });

    detachWithDescriptorScope(scope, () => state.destroy());

    return state;
  });

  const scope = getReadableClosureScope(closure);

  if (isReadableClosure(source)) {
    ownReadableClosure(scope, source);
  }

  return closure;
}

/**
 * Keeps one owned state flow per list position and follows its current value.
 * Branded descriptors infer their resolved value before inspecting tuple factories.
 */
export function mapEachClosure<T, R>(
  source: StateSource<readonly T[]>,
  mapper: (item: IReadableClosure<T>, index: number) => MarkedStateClosureDescriptor<R>,
  itemDistinctor?: Distinctor<T>,
): IReadableClosure<R[]>;
export function mapEachClosure<T, R>(
  source: StateSource<readonly T[]>,
  mapper: (item: IReadableClosure<T>, index: number) => StateClosureSource<R>,
  itemDistinctor?: Distinctor<T>,
): IReadableClosure<R[]>;
export function mapEachClosure<T, R>(
  source: StateSource<readonly T[]>,
  mapper: (item: IReadableClosure<T>, index: number) => StateClosureSource<R>,
  itemDistinctor?: Distinctor<T>,
): IReadableClosure<R[]> {
  const closure = FactoryReadableClosure.create(() => {
    const sourceState = input.value;

    const createEntry = (value: T, index: number): ListEntry<T, R> => {
      const item = new MutableState({ initial: value, distinctor: itemDistinctor });

      StateNode.get(item).dependOn(StateNode.get(sourceState), { ordering: true });

      const readable = FactoryReadableClosure.create(() => item);

      clearWithDescriptorScope(getReadableClosureScope(readable), () => item.destroy());

      const child = FactoryReadableClosure.create(() => toClosure(mapper(readable, index)));

      ownReadableClosure(getReadableClosureScope(child), readable);
      ownReadableClosure(scope, child);

      try {
        return { input: item, closure: child, state: child.value };
      } catch (error) {
        releaseReadableClosure(scope, child);

        throw error;
      }
    };

    const releaseEntries = (items: ListEntry<T, R>[]) => {
      const cleanup = new Subscription();

      for (const entry of items) {
        cleanup.add(() => {
          entry.subscription?.unsubscribe();

          releaseReadableClosure(scope, entry.closure);
        });
      }

      cleanup.unsubscribe();
    };

    let previousItems = sourceState.value;
    let entries = previousItems.map(createEntry);

    const state: ReactiveState<R[]> = new ReactiveState({
      initial: entries.map((entry) => entry.state.value),
      distinctor: shallowEqual,
      emitter: (observer) => {
        const subscriptions = new Subscription();

        let stopped = false;
        let completed = false;

        const fail = (error: unknown) => {
          if (stopped) {
            return;
          }

          stopped = true;

          observer.error(error);
        };

        const refresh = () => {
          if (stopped) {
            return;
          }

          try {
            observer.next(entries.map((entry) => entry.state.value));

            if (completed && entries.every((entry) => entry.state.closed)) {
              stopped = true;

              observer.complete();
            }
          } catch (error) {
            fail(error);
          }
        };

        const scheduleRefresh = () => {
          StateNode.get(state).schedule(refresh);
        };

        const connectEntry = (entry: ListEntry<T, R>) => {
          entry.subscription = entry.state.subscribe({
            next: scheduleRefresh,
            error: fail,
            complete: scheduleRefresh,
          });

          subscriptions.add(entry.subscription);
        };

        const update = (items: readonly T[]) => {
          if (stopped || items === previousItems) {
            return;
          }

          const created: ListEntry<T, R>[] = [];

          try {
            for (let index = entries.length; index < items.length; index++) {
              created.push(createEntry(items[index], index));
            }

            const removed = entries.slice(items.length);

            entries = [...entries.slice(0, items.length), ...created];

            previousItems = items;

            batch(() => {
              entries.forEach((entry, index) => entry.input.next(items[index]));
              created.forEach(connectEntry);

              releaseEntries(removed);
              scheduleRefresh();
            });
          } catch (error) {
            releaseEntries(created);
            fail(error);
          }
        };

        batch(() => {
          entries.forEach(connectEntry);

          subscriptions.add(
            sourceState.subscribe({
              next: update,
              error: fail,
              complete: () => {
                completed = true;

                batch(() => {
                  entries.forEach((entry) => entry.input.complete());
                  scheduleRefresh();
                });
              },
            }),
          );
        });

        return () => {
          stopped = true;

          subscriptions.unsubscribe();
        };
      },
    });

    detachWithDescriptorScope(scope, () => state.destroy());

    return state;
  });

  const scope = getReadableClosureScope(closure);
  const input = ownReadableClosure(scope, toClosure(source));

  return closure;
}
