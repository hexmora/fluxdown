import { Subscription } from 'rxjs';
import { shallowEqual } from 'shallow-equal';

import type { StateSubscription } from '../../../__internal__';
import type { Distinctor, IReactiveState, StateSource, StateValue } from '../../../reactive-state';
import type { IReadableClosure, ListEntry, StateClosureSource } from '../../type';
import type {
  MarkedStateClosureDescriptor,
  StateClosureResult,
  StateClosureResultNode,
  StateClosureResultValue,
} from '../render';

import {
  clearWithDescriptorScope,
  getReadableClosureScope,
  isNativeStateLike,
  isReactiveStateLike,
  observeState,
  ownReadableClosure,
  releaseReadableClosure,
  StateNode,
} from '../../../__internal__';
import { MutableState } from '../../../mutable-state';
import { ReactiveState, toState } from '../../../reactive-state';
import { batch } from '../../../state-graph';
import { FactoryReadableClosure, toClosure } from '../../main';
import { isFreshDescriptor, isImmediateDescriptor, StateClosureHookRuntime } from '../../utils';
import { isReadableClosure } from '../predicates';
import { render } from '../render';

type CollectionEntry<T, R> = Omit<ListEntry<T, R>, 'subscription'> & {
  value: R;
  inputClosure?: IReadableClosure<T>;
  native: boolean;
  completed: boolean;
  subscription?: StateSubscription;
};

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

        let subscription: StateSubscription | null = null;

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
          subscription = observeState(inner, {
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
            observeState(input, {
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

    return state;
  }, true);

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

    const createEntry = (value: T, index: number): CollectionEntry<T, R> => {
      const item = new MutableState({ initial: value, distinctor: itemDistinctor });

      StateNode.get(item).dependOn(StateNode.get(sourceState), { ordering: true });

      const readable = FactoryReadableClosure.create(() => item);

      clearWithDescriptorScope(getReadableClosureScope(readable), () => item.destroy());

      ownReadableClosure(scope, readable);

      let child: IReadableClosure<R> | undefined;

      try {
        const result = StateClosureHookRuntime.run(null, () => mapper(readable, index));

        const direct = isFreshDescriptor<R>(result);

        child = direct ? render<R>(result) : FactoryReadableClosure.create(() => toClosure(result));

        if (!direct) {
          ownReadableClosure(getReadableClosureScope(child), readable);

          releaseReadableClosure(scope, readable);
        }

        ownReadableClosure(scope, child);

        const state = child.value;

        return {
          input: item,
          inputClosure: direct ? readable : undefined,
          closure: child,
          state,
          value: state.value,
          native: isNativeStateLike(state),
          completed: state.closed,
        };
      } catch (error) {
        try {
          if (child) {
            releaseReadableClosure(scope, child);
          }
        } finally {
          releaseReadableClosure(scope, readable);
        }

        throw error;
      }
    };

    const releaseEntries = (items: CollectionEntry<T, R>[]) => {
      const cleanup = new Subscription();

      for (const entry of items) {
        const { subscription, closure: child, inputClosure } = entry;

        cleanup.add(subscription);

        cleanup.add(() => releaseReadableClosure(scope, child));

        if (inputClosure) {
          cleanup.add(() => releaseReadableClosure(scope, inputClosure));
        }
      }

      cleanup.unsubscribe();
    };

    let previousItems = sourceState.value;
    const entries = previousItems.map(createEntry);

    const state: ReactiveState<R[]> = new ReactiveState({
      initial: entries.map((entry) => entry.value),
      distinctor: shallowEqual,
      emitter: (observer) => {
        const subscriptions = new Subscription();

        let stopped = false;
        let completed = false;

        let valuesChanged = false;

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
            if (valuesChanged) {
              valuesChanged = false;

              observer.next(
                entries.map((entry) => (entry.native ? entry.value : entry.state.value)),
              );
            }

            if (
              completed &&
              entries.every((entry) => (entry.native ? entry.completed : entry.state.closed))
            ) {
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

        const connectEntry = (entry: CollectionEntry<T, R>) => {
          let connecting = true;

          entry.subscription = observeState(entry.state, {
            next: (value) => {
              const current = connecting ? entry.state.value : value;

              if (!entry.native || !Object.is(entry.value, current)) {
                entry.value = current;

                valuesChanged = true;

                scheduleRefresh();
              }
            },
            error: fail,
            complete: () => {
              entry.completed = true;

              if (completed) {
                scheduleRefresh();
              }
            },
          });

          connecting = false;

          subscriptions.add(entry.subscription);
        };

        const update = (items: readonly T[]) => {
          if (stopped || items === previousItems) {
            return;
          }

          const created: CollectionEntry<T, R>[] = [];

          try {
            for (let index = entries.length; index < items.length; index++) {
              created.push(createEntry(items[index], index));
            }

            const retainedLength = Math.min(entries.length, items.length);
            const previous = previousItems;
            const removed = items.length < entries.length ? entries.splice(items.length) : [];

            for (const entry of created) {
              entries.push(entry);
            }

            previousItems = items;

            if (removed.length > 0 || created.length > 0) {
              valuesChanged = true;
            }

            batch(() => {
              for (let index = 0; index < retainedLength; index++) {
                if (itemDistinctor || !Object.is(previous[index], items[index])) {
                  entries[index].input.next(items[index]);
                }
              }

              if (itemDistinctor) {
                for (let index = retainedLength; index < entries.length; index++) {
                  entries[index].input.next(items[index]);
                }
              }

              created.forEach(connectEntry);

              releaseEntries(removed);

              if (valuesChanged) {
                scheduleRefresh();
              }
            });
          } catch (error) {
            releaseEntries(created);
            fail(error);
          }
        };

        batch(() => {
          entries.forEach(connectEntry);

          subscriptions.add(
            observeState(sourceState, {
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

    return state;
  }, true);

  const scope = getReadableClosureScope(closure);
  const input = ownReadableClosure(scope, toClosure(source));

  return closure;
}
