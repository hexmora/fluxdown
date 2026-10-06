import { Subscription } from 'rxjs';
import { shallowEqual } from 'shallow-equal';

import type { IReactiveState, StateSource } from '../../reactive-state';
import type { IReadableClosure, StateClosureSource } from '../type';
import type { MarkedStateClosureDescriptor } from './render';

import { ReactiveState } from '../../reactive-state';
import { isNativeState, observeState, type StateSubscription } from '../../reactive-state/observe';
import { batch } from '../../state-graph/batch';
import { getStateNode } from '../../state-graph/node';
import { FactoryReadableClosure, toClosure } from './base';
import {
  clearWithDescriptorScope,
  getReadableClosureScope,
  ownReadableClosure,
  releaseReadableClosure,
} from './render/utils/context';

type KeyedEntry<T> = {
  closure: IReadableClosure<T>;
  state: IReactiveState<T>;
  value: T;
  native: boolean;
  completed: boolean;
  subscription?: StateSubscription;
};

/**
 * Keeps one owned child per input identity, using Map key equality.
 * Reordering retains children; duplicate items share a child and appear in every output slot.
 */
export function mapKeyedClosure<T, R>(
  source: StateSource<readonly T[]>,
  mapper: (item: T) => MarkedStateClosureDescriptor<R>,
): IReadableClosure<R[]>;
export function mapKeyedClosure<T, R>(
  source: StateSource<readonly T[]>,
  mapper: (item: T) => StateClosureSource<R>,
): IReadableClosure<R[]>;
export function mapKeyedClosure<T, R>(
  source: StateSource<readonly T[]>,
  mapper: (item: T) => StateClosureSource<R>,
): IReadableClosure<R[]> {
  const closure = FactoryReadableClosure.create(() => {
    const sourceState = input.value;

    const createEntry = (item: T): KeyedEntry<R> => {
      const child = FactoryReadableClosure.create(() => {
        const childScope = getReadableClosureScope(child);

        const mapped = ownReadableClosure(childScope, toClosure(mapper(item)));

        const disconnect = getStateNode(mapped.value).dependOn(getStateNode(sourceState), {
          ordering: true,
        });

        clearWithDescriptorScope(childScope, disconnect);

        return mapped;
      });

      ownReadableClosure(scope, child);

      try {
        const state = child.value;

        return {
          closure: child,
          state,
          value: state.value,
          native: isNativeState(state),
          completed: state.closed,
        };
      } catch (error) {
        releaseReadableClosure(scope, child);

        throw error;
      }
    };

    const releaseEntries = (entries: Iterable<KeyedEntry<R>>) => {
      const cleanup = new Subscription();

      for (const entry of entries) {
        cleanup.add(() => {
          try {
            entry.subscription?.unsubscribe();
          } finally {
            releaseReadableClosure(scope, entry.closure);
          }
        });
      }

      cleanup.unsubscribe();
    };

    let previousItems = sourceState.value;

    let entries = new Map<T, KeyedEntry<R>>();

    let slots = previousItems.map((item) => {
      let entry = entries.get(item);

      if (!entry) {
        entry = createEntry(item);

        entries.set(item, entry);
      }

      return entry;
    });

    const state: ReactiveState<R[]> = new ReactiveState({
      initial: slots.map((entry) => entry.value),
      distinctor: shallowEqual,
      emitter: (observer) => {
        const subscriptions = new Subscription();

        let stopped = false;

        let sourceCompleted = false;

        let completed = false;

        let valuesChanged = false;

        const fail = (error: unknown) => {
          if (!stopped) {
            stopped = true;

            observer.error(error);
          }
        };

        const refresh = () => {
          if (stopped) {
            return;
          }

          try {
            if (valuesChanged) {
              valuesChanged = false;

              observer.next(slots.map((entry) => (entry.native ? entry.value : entry.state.value)));
            }

            if (
              sourceCompleted &&
              slots.every((entry) => (entry.native ? entry.completed : entry.state.closed))
            ) {
              stopped = true;

              completed = true;

              observer.complete();
            }
          } catch (error) {
            fail(error);
          }
        };

        const scheduleRefresh = () => getStateNode(state).schedule(refresh);

        const connectEntry = (entry: KeyedEntry<R>) => {
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

              if (sourceCompleted) {
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

          const created: KeyedEntry<R>[] = [];

          try {
            let prefix = 0;

            while (
              prefix < previousItems.length &&
              prefix < items.length &&
              Object.is(previousItems[prefix], items[prefix])
            ) {
              prefix += 1;
            }

            if (prefix === previousItems.length && items.length >= prefix) {
              for (let index = prefix; index < items.length; index++) {
                const item = items[index];
                let entry = entries.get(item);

                if (!entry) {
                  entry = createEntry(item);

                  entries.set(item, entry);

                  created.push(entry);
                }

                slots.push(entry);
              }

              valuesChanged ||= items.length !== previousItems.length;

              previousItems = items;

              batch(() => {
                created.forEach(connectEntry);

                if (valuesChanged) {
                  scheduleRefresh();
                }
              });

              return;
            }

            const next = new Map<T, KeyedEntry<R>>();
            const nextSlots = items.map((item) => {
              let entry = next.get(item) ?? entries.get(item);

              if (!entry) {
                entry = createEntry(item);

                created.push(entry);
              }

              next.set(item, entry);

              return entry;
            });

            const removed: KeyedEntry<R>[] = [];

            for (const [item, entry] of entries) {
              if (!next.has(item)) {
                removed.push(entry);
              }
            }

            entries = next;

            valuesChanged ||=
              slots.length !== nextSlots.length ||
              slots.some((entry, index) => entry !== nextSlots[index]);

            slots = nextSlots;

            previousItems = items;

            batch(() => {
              created.forEach(connectEntry);

              releaseEntries(removed);

              if (valuesChanged) {
                scheduleRefresh();
              }
            });
          } catch (error) {
            try {
              releaseEntries(created);
            } finally {
              fail(error);
            }
          }
        };

        batch(() => {
          entries.forEach(connectEntry);

          subscriptions.add(
            observeState(sourceState, {
              next: update,
              error: fail,
              complete: () => {
                sourceCompleted = true;

                scheduleRefresh();
              },
            }),
          );
        });

        return () => {
          stopped = true;

          try {
            subscriptions.unsubscribe();
          } finally {
            if (!completed) {
              const previous = entries;

              entries = new Map();

              slots = [];

              releaseEntries(previous.values());
            }
          }
        };
      },
    });

    return state;
  }, true);

  const scope = getReadableClosureScope(closure);

  const input = ownReadableClosure(scope, toClosure(source));

  return closure;
}
