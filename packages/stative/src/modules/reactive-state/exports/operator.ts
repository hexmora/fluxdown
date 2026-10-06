import { isFunction, isUndefined } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';
import { shallowEqual } from 'shallow-equal';

import type {
  Distinctor,
  IReactiveState,
  StateMapper,
  StateSubscriber,
  StateValue,
  StateValues,
} from '../type';

import { compute } from '../../../utils';
import { getStateContext, withStateContext } from '../../state-graph/context';
import { getStateNode } from '../../state-graph/node';
import { observeState, type StateSubscription } from '../observe';
import { ReactiveState } from './base';
import { isReactiveStateLike, isStateClosureLike, isStateSourceLike } from './utils';

export { isReactiveStateLike } from './utils';

type ReactiveStateSource<T> = IReactiveState<T> | BehaviorSubject<T>;

const createMappedState = <A, B>(
  source: ReactiveStateSource<A>,
  initialSource: A,
  mapper: StateMapper<A, B>,
  distinctor?: Distinctor<B>,
  ordering = false,
): ReactiveState<B> => {
  const initial = mapper(initialSource, null);

  let prev: [A, B] = [initialSource, initial];

  const state = new ReactiveState({
    initial,
    emitter: (observer) => {
      const subscriber: StateSubscriber<A> = {
        next: (value) => {
          const nextResult = ordering
            ? withStateContext(getStateContext(), () => mapper(value, prev))
            : mapper(value, prev);

          observer.next(nextResult);

          prev = [value, nextResult];
        },
        error: (error) => observer.error(error),
        complete: () => observer.complete(),
      };

      const subscription = observeState(
        source,
        subscriber,
        ordering ? { ordering: true } : undefined,
      );

      return () => {
        subscription.unsubscribe();
      };
    },
    distinctor,
  });

  return state;
};

export const toState = <S>(source: S): IReactiveState<StateValue<S>> => {
  if (isReactiveStateLike<StateValue<S>>(source)) {
    return source;
  }

  if (isStateClosureLike<StateValue<S>>(source)) {
    return source.value;
  }

  return ReactiveState.of(source as StateValue<S>);
};

export function toReactiveState<T>(
  observable: Observable<T>,
  current: T,
  distinctor?: Distinctor<T>,
): ReactiveState<T>;
export function toReactiveState<T>(
  subject: BehaviorSubject<T>,
  distinctor?: Distinctor<T>,
): ReactiveState<T>;
export function toReactiveState<T>(
  source: Observable<T> | BehaviorSubject<T>,
  currentOrDistinctor?: T | Distinctor<T>,
  distinctor?: Distinctor<T>,
): ReactiveState<T> {
  const isBehaviorSubject = source instanceof BehaviorSubject;

  const initial = compute(() => {
    if (isBehaviorSubject) {
      return source.value;
    }

    if (isFunction(currentOrDistinctor) || isUndefined(currentOrDistinctor)) {
      throw new TypeError('Observable sources require an explicit current value.');
    }

    return currentOrDistinctor;
  });

  const stateDistinctor = compute(() => {
    if (!isBehaviorSubject) {
      return distinctor;
    }

    if (currentOrDistinctor !== undefined && !isFunction(currentOrDistinctor)) {
      throw new TypeError('BehaviorSubject sources accept a distinctor, not a current value.');
    }

    return currentOrDistinctor as Distinctor<T> | undefined;
  });

  return new ReactiveState({
    initial,
    emitter: (observer) =>
      source.subscribe({
        next: (value) => {
          observer.next(value);
        },
        error: (error) => {
          observer.error(error);
        },
        complete: () => {
          observer.complete();
        },
      }),
    distinctor: stateDistinctor,
  });
}

const deriveState = <S, B>(
  source: S,
  mapper: StateMapper<StateValue<S>, B>,
  distinctor?: Distinctor<B>,
  ordering = false,
): ReactiveState<B> => {
  if (!isStateSourceLike(source)) {
    return ReactiveState.of(mapper(source as StateValue<S>, null));
  }

  const state = toState(source);

  return createMappedState(state, state.value, mapper, distinctor, ordering);
};

export const mapState = <S, B>(
  source: S,
  mapper: StateMapper<StateValue<S>, B>,
  distinctor?: Distinctor<B>,
): ReactiveState<B> => deriveState(source, mapper, distinctor);

/** Keep shared derived values behind an equality boundary while preserving synchronous reads. */
export const selectState = <S, B>(
  source: S,
  mapper: StateMapper<StateValue<S>, B>,
  distinctor?: Distinctor<B>,
): ReactiveState<B> => deriveState(source, mapper, distinctor, true);

export const combineMapState = <const TSources extends [unknown, ...unknown[]], T>(
  sources: [...TSources],
  mapper: StateMapper<StateValues<TSources>, T>,
  distinctor?: Distinctor<T>,
): ReactiveState<T> => {
  type TValues = StateValues<TSources>;

  if (sources.every((source) => !isStateSourceLike(source))) {
    return ReactiveState.of(mapper(sources as TValues, null));
  }

  const states = sources.map(toState) as {
    [K in keyof TSources]: IReactiveState<StateValue<TSources[K]>>;
  };

  const initialValues = states.map((state) => state.value) as TValues;

  const initial = mapper(initialValues, null);

  let prev: [TValues, T] = [initialValues, initial];

  const state = new ReactiveState({
    initial,
    emitter: (observer) => {
      const latestValues = [...prev[0]] as TValues;

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
          const nextValues = [...latestValues] as TValues;

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
        getStateNode(state).schedule(refresh);
      };

      const subscriptions: StateSubscription[] = [];

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

      return () => {
        closed = true;

        for (const subscription of subscriptions) {
          subscription.unsubscribe();
        }
      };
    },
    distinctor,
  });

  return state;
};

export const combineState = <const TSources extends [unknown, ...unknown[]]>(
  ...sources: TSources
): ReactiveState<StateValues<TSources>> =>
  combineMapState<TSources, StateValues<TSources>>(sources, (values) => values, shallowEqual);
