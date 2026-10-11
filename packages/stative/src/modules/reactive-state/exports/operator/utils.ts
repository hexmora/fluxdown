import type { BehaviorSubject } from 'rxjs';

import { isFunction, isObject } from 'lodash-es';

import type { IReadableClosure } from '../../../state-closure';
import type {
  Distinctor,
  IReactiveState,
  StateMapper,
  StateSubscriber,
  StateValue,
} from '../../type';

import { toState } from '.';
import { StateContext } from '../../../state-graph/utils/context';
import { ReactiveState } from '../../main';

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
            ? StateContext.run(StateContext.current, () => mapper(value, prev))
            : mapper(value, prev);

          observer.next(nextResult);

          prev = [value, nextResult];
        },
        error: (error) => observer.error(error),
        complete: () => observer.complete(),
      };

      const subscription = ordering
        ? StateContext.run(StateContext.current, () => source.subscribe(subscriber), {
            ordering: true,
          })
        : source.subscribe(subscriber);

      return () => {
        subscription.unsubscribe();
      };
    },
    distinctor,
  });

  return state;
};

export const isReactiveStateLike = <T = unknown>(value: unknown): value is IReactiveState<T> =>
  isObject(value) &&
  'value' in value &&
  'closed' in value &&
  isFunction((value as Partial<IReactiveState<T>>).subscribe);

export const isStateClosureLike = <T = unknown>(value: unknown): value is IReadableClosure<T> => {
  return (
    isObject(value) &&
    'value' in value &&
    'destroy' in value &&
    !isReactiveStateLike(value) &&
    isFunction(value.destroy)
  );
};

export const isStateSourceLike = (value: unknown) => {
  return isReactiveStateLike(value) || isStateClosureLike(value);
};

export const deriveState = <S, B>(
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
