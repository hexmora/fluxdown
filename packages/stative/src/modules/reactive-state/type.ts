import type { BehaviorSubject } from 'rxjs';

import type { Distinctor, EmitterFunction, IReactiveState } from '../__internal__';
import type { IReadableClosure } from '../state-closure';

export type {
  Distinctor,
  EmitterFunction,
  IReactiveState,
  NextFunction,
  StateSubscriber,
} from '../__internal__';

export type ReactiveStateParams<T> = {
  initial: T;

  emitter?: EmitterFunction<T>;

  distinctor?: Distinctor<T>;

  /**
   * Defer side effects that drive value updates until the value or value state
   * is accessed.
   * @default true
   */
  lazy?: boolean;
};

export type StateValue<T> =
  T extends IReactiveState<infer V>
    ? V
    : T extends BehaviorSubject<infer V>
      ? V
      : T extends IReadableClosure<infer V>
        ? V
        : T;

export type StateSource<T> =
  T extends IReactiveState<unknown>
    ? T
    : T extends BehaviorSubject<unknown>
      ? T
      : T extends IReadableClosure<unknown>
        ? T
        : T | IReactiveState<T> | BehaviorSubject<T> | IReadableClosure<T>;

export type StateValues<TSources extends readonly unknown[]> = {
  [K in keyof TSources]: StateValue<TSources[K]>;
};

export type StateMapper<A, B> = (value: A, prev: [A, B] | null) => B;

/** Arrays describe a list of sources; wrap an array value in a state to map it as one input. */
export type StateInputValue<S> = S extends readonly unknown[] ? StateValues<[...S]> : StateValue<S>;
