import { isArray, isFunction, isObject } from 'lodash-es';

import type {
  ImmediateDescriptor,
  RuntimeSlottedDescriptor,
  StateClosureDescriptor,
} from '../../exports';
import type { IReadableClosure } from '../../type';

import {
  immediateDescriptor,
  isClass,
  isMarkedStateClosureDescriptor,
  isReactiveStateLike,
} from '../../../__internal__';
import { isOnceFunction } from '../once';

export const isImmediateDescriptor = <T = unknown>(
  value: unknown,
): value is ImmediateDescriptor<T> => {
  return isObject(value) && immediateDescriptor in value;
};

export const unwrapImmediateDescriptor = <T>(descriptor: ImmediateDescriptor<T>): T => {
  return descriptor[immediateDescriptor];
};

export const isReadableClosure = <T = unknown>(value: unknown): value is IReadableClosure<T> => {
  return (
    isObject(value) &&
    !isReactiveStateLike(value) &&
    'value' in value &&
    'destroy' in value &&
    isFunction(value.destroy)
  );
};

export const isSlottedDescriptor = (value: unknown): value is RuntimeSlottedDescriptor => {
  return (
    isArray(value) &&
    isFunction(value[0]) &&
    (value.length === 2 ||
      (value.length === 3 &&
        !isClass(value[0]) &&
        !isOnceFunction(value[0]) &&
        (value[2] === undefined || isFunction(value[2]))))
  );
};

export const isStateClosureDescriptor = <T = unknown>(
  value: unknown,
): value is StateClosureDescriptor<T> => {
  return (
    value === null ||
    isImmediateDescriptor<T>(value) ||
    isReadableClosure<T>(value) ||
    isSlottedDescriptor(value) ||
    isClass(value)
  );
};

export const isReadableSourceDescriptor = (source: unknown) => {
  return (
    isReadableClosure(source) ||
    isClass(source) ||
    (isMarkedStateClosureDescriptor(source) && isSlottedDescriptor(source))
  );
};

/** Descriptors create their own lifetime; existing closures can be shared by other owners. */
export const isFreshDescriptor = <T = unknown>(
  value: unknown,
): value is StateClosureDescriptor<T> => {
  return isStateClosureDescriptor<T>(value) && !isReadableClosure(value);
};
