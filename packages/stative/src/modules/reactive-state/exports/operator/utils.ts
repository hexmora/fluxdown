import { shallowEqual } from 'shallow-equal';

import type { StateSubscription } from '../../../__internal__';
import type { Distinctor, IReactiveState, StateMapper } from '../../type';

import { observeState, StateNode } from '../../../__internal__';
import { ReactiveState } from '../../main';
import { clearSubscriptions } from '../../utils';

export const mapSources = <T>(
  states: readonly IReactiveState<unknown>[],
  mapper: StateMapper<unknown[], T>,
  distinctor?: Distinctor<T>,
): ReactiveState<T> => {
  const initialValues = states.map((state) => state.value);

  const initial = mapper(initialValues, null);

  let prev: [unknown[], T] = [initialValues, initial];

  const state = new ReactiveState({
    initial,
    emitter: (observer) => {
      const latestValues = [...prev[0]];

      const completed = states.map(() => false);

      let previousValues = prev[0];

      let closed = false;

      let failed = false;

      let finalError: unknown;

      const refresh = () => {
        if (closed) {
          return;
        }

        if (failed) {
          closed = true;

          observer.error(finalError);

          return;
        }

        for (let index = 0; index < states.length; index++) {
          latestValues[index] = states[index].value;
        }

        if (!shallowEqual(latestValues, previousValues)) {
          const nextValues = [...latestValues];

          previousValues = nextValues;

          const nextResult = mapper(nextValues, prev);

          prev = [nextValues, nextResult];

          observer.next(nextResult);
        }

        if (!completed.every(Boolean)) {
          return;
        }

        closed = true;

        observer.complete();
      };

      const scheduleRefresh = () => {
        StateNode.get(state).schedule(refresh);
      };

      const subscriptions: StateSubscription[] = [];

      try {
        for (let index = 0; index < states.length; index++) {
          if (closed) {
            break;
          }

          const subscription = observeState(states[index], {
            next: () => {
              if (closed) {
                return;
              }

              scheduleRefresh();
            },
            error: (error) => {
              if (closed || failed) {
                return;
              }

              failed = true;

              finalError = error;

              scheduleRefresh();
            },
            complete: () => {
              if (closed) {
                return;
              }

              completed[index] = true;

              scheduleRefresh();
            },
          });

          subscriptions.push(subscription);
        }
      } catch (error) {
        closed = true;

        try {
          clearSubscriptions(subscriptions);
        } catch {
          // Cleanup attempts every input; keep the original setup failure primary.
        }

        throw error;
      }

      return () => {
        closed = true;

        clearSubscriptions(subscriptions);
      };
    },
    distinctor,
  });

  return state;
};
