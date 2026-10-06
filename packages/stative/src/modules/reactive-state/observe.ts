import type { IReactiveState, StateSubscriber } from './type';

import { getStateContext, withStateContext } from '../state-graph/context';

export const nativeState = /*#__PURE__*/ Symbol('stative.native');

export type StateSubscription = {
  readonly closed: boolean;

  unsubscribe(): void;
};

export type ObserveStateOptions = { ordering?: boolean };

export type PublishedState<T> = {
  value: T;

  closed: boolean;

  failed: boolean;

  error: unknown;
};

export type NativeStateAccess<T> = {
  observe(subscriber: StateSubscriber<T>, options?: ObserveStateOptions): StateSubscription;

  getPublishedState(): PublishedState<T>;
};

export type NativeState<T> = IReactiveState<T> & {
  readonly [nativeState]: NativeStateAccess<T>;
};

export const isNativeState = <T>(state: IReactiveState<T>): state is NativeState<T> => {
  return nativeState in state && !!(state as NativeState<T>)[nativeState];
};

/** Respect custom getters and subscription adapters instead of bypassing their behavior. */
export const hasNativeAccessors = (state: object, prototype: object): boolean => {
  for (const key of ['value', 'closed', 'subscribe']) {
    const expected = Object.getOwnPropertyDescriptor(prototype, key);

    let current: object | null = state;

    while (current) {
      const descriptor = Object.getOwnPropertyDescriptor(current, key);

      if (descriptor) {
        if (descriptor.get !== expected?.get || descriptor.value !== expected?.value) {
          return false;
        }

        break;
      }

      current = Object.getPrototypeOf(current);
    }
  }

  return true;
};

export const readPublishedState = <T>(state: NativeState<T>): PublishedState<T> => {
  return state[nativeState].getPublishedState();
};

/** Internal edges do not need an RxJS subscriber or observable adapter. */
export const observeState = <T>(
  state: IReactiveState<T>,
  subscriber: StateSubscriber<T>,
  options?: ObserveStateOptions,
): StateSubscription => {
  if (isNativeState(state)) {
    return state[nativeState].observe(subscriber, options);
  }

  return options
    ? withStateContext(getStateContext(), () => state.subscribe(subscriber), options)
    : state.subscribe(subscriber);
};
