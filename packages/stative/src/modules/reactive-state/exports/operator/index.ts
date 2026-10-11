import { isArray, isFunction, isUndefined } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';
import { shallowEqual } from 'shallow-equal';

import type {
  Distinctor,
  IReactiveState,
  StateInputValue,
  StateMapper,
  StateValue,
  StateValues,
} from '../../type';

import {
  compute,
  isReactiveStateLike,
  isStateClosureLike,
  isStateSourceLike,
} from '../../../__internal__';
import { ReactiveState } from '../../main';
import { deriveState } from '../../utils';
import { mapSources } from './utils';

export { isReactiveStateLike } from '../../../__internal__';

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

export function mapState<const S extends readonly unknown[], R>(
  sources: readonly [...S],
  mapper: StateMapper<StateValues<[...S]>, R>,
  distinctor?: Distinctor<R>,
): ReactiveState<R>;
export function mapState<S, R>(
  source: S,
  mapper: StateMapper<StateInputValue<S>, R>,
  distinctor?: Distinctor<R>,
): ReactiveState<R>;
export function mapState<S, R>(
  source: S,
  mapper: StateMapper<StateInputValue<S>, R>,
  distinctor?: Distinctor<R>,
): ReactiveState<R> {
  if (isArray(source)) {
    if (source.every((item) => !isStateSourceLike(item))) {
      return ReactiveState.of(mapper(source as StateInputValue<S>, null));
    }

    return mapSources(source.map(toState), mapper as StateMapper<unknown[], R>, distinctor);
  }

  if (!isStateSourceLike(source)) {
    return ReactiveState.of(mapper(source as StateInputValue<S>, null));
  }

  return deriveState(toState(source), mapper as StateMapper<StateValue<S>, R>, distinctor);
}

export const combineState = <const TSources extends [unknown, ...unknown[]]>(
  ...sources: TSources
): ReactiveState<StateValues<TSources>> =>
  mapState<TSources, StateValues<TSources>>(sources, (values) => values, shallowEqual);
