import { isFunction } from 'lodash-es';

import type { AnyOnceFunction } from '../exports';

export const onceFunction = /*#__PURE__*/ Symbol('onceFunction');

export const isOnceFunction = (factory: unknown): factory is AnyOnceFunction => {
  return isFunction(factory) && Reflect.get(factory, onceFunction) === true;
};
