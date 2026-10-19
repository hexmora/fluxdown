import { isFunction, isObject } from 'lodash-es';

import type { IReadableClosure } from '../type';

import { isReactiveStateLike } from '../../__internal__';

export const isReadableClosure = <T = unknown>(value: unknown): value is IReadableClosure<T> => {
  return (
    isObject(value) &&
    !isReactiveStateLike(value) &&
    'value' in value &&
    'destroy' in value &&
    isFunction(value.destroy)
  );
};
