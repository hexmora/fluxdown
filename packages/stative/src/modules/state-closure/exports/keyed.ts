import { Subscription } from 'rxjs';
import { shallowEqual } from 'shallow-equal';

import type { IReactiveState, StateSource } from '../../reactive-state';
import type { IReadableClosure, StateClosureSource } from '../type';
import type { MarkedStateClosureDescriptor } from './render';

import { ReactiveState } from '../../reactive-state';
import { batch } from '../../state-graph/batch';
import { getStateNode } from '../../state-graph/node';
import { FactoryReadableClosure, toClosure } from './base';
import {
  clearWithDescriptorScope,
  detachWithDescriptorScope,
  getReadableClosureScope,
  ownReadableClosure,
  releaseReadableClosure,
} from './render/utils/context';

type KeyedEntry<T> = {
  closure: IReadableClosure<T>;
  state: IReactiveState<T>;
  subscription?: Subscription;
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
        return { closure: child, state: child.value };
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
      initial: slots.map((entry) => entry.state.value),
      distinctor: shallowEqual,
      emitter: (observer) => {
        const subscriptions = new Subscription();

        let stopped = false;

        let sourceCompleted = false;

        let completed = false;

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
            observer.next(slots.map((entry) => entry.state.value));

            if (sourceCompleted && slots.every((entry) => entry.state.closed)) {
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

          const next = new Map<T, KeyedEntry<R>>();

          const created: KeyedEntry<R>[] = [];

          try {
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

            slots = nextSlots;

            previousItems = items;

            batch(() => {
              created.forEach(connectEntry);

              releaseEntries(removed);

              scheduleRefresh();
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
            sourceState.subscribe({
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

    detachWithDescriptorScope(scope, () => state.destroy());

    return state;
  });

  const scope = getReadableClosureScope(closure);

  const input = ownReadableClosure(scope, toClosure(source));

  return closure;
}
