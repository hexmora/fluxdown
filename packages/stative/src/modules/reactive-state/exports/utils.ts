import { isFunction, isObject } from 'lodash-es';

import type { IReadableClosure } from '../../state-closure';
import type { IReactiveState } from '../type';

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
