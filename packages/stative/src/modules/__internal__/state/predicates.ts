import { isFunction, isObject } from 'lodash-es';

import type {
  FixedStateValueLike,
  IReactiveState,
  NativeStateAccess,
  NativeStateLike,
  StateClosureLike,
} from './type';

export const isReactiveStateLike = <T = unknown>(value: unknown): value is IReactiveState<T> =>
  isObject(value) &&
  'value' in value &&
  'closed' in value &&
  'subscribe' in value &&
  isFunction(value.subscribe);

export const isStateClosureLike = <T = unknown>(value: unknown): value is StateClosureLike<T> => {
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

export const isNativeStateAccessLike = <T>(access: unknown): access is NativeStateAccess<T> => {
  return (
    isObject(access) &&
    'observe' in access &&
    typeof access.observe === 'function' &&
    'getPublishedState' in access &&
    typeof access.getPublishedState === 'function'
  );
};

/** Resolve the capability once so custom native getters are not read twice. */
export const getNativeStateAccess = <T>(state: IReactiveState<T>): NativeStateAccess<T> | null => {
  const access = '__nativeState' in state ? state.__nativeState : null;

  return isNativeStateAccessLike<T>(access) ? access : null;
};

export const isNativeStateLike = <T>(state: IReactiveState<T>): state is NativeStateLike<T> => {
  return getNativeStateAccess(state) !== null;
};

export const isFixedStateValueLike = (state: object): state is FixedStateValueLike => {
  return '__fixedStateValue' in state && state.__fixedStateValue === true;
};

/** Respect custom getters and subscription adapters instead of bypassing their behavior. */
export const hasNativeAccessors = (state: object, prototype: object): boolean => {
  let current: object | null = state;

  while (current && current !== prototype) {
    if (
      Object.hasOwn(current, 'value') ||
      Object.hasOwn(current, 'closed') ||
      Object.hasOwn(current, 'subscribe')
    ) {
      return false;
    }

    current = Object.getPrototypeOf(current);
  }

  return current === prototype;
};

/** Value caches do not bypass observation or publication behavior. */
export const getStateRevision = (state: IReactiveState<unknown>): number | undefined => {
  const revision = '__revision' in state ? state.__revision : undefined;

  return typeof revision === 'number' ? revision : undefined;
};

/** A custom value getter cannot certify its contents with the native value counter. */
export const hasNativeValueAccessor = (state: object, prototype: object): boolean => {
  let current: object | null = state;

  while (current && current !== prototype) {
    if (Object.hasOwn(current, 'value')) {
      return false;
    }

    current = Object.getPrototypeOf(current);
  }

  return current === prototype;
};
