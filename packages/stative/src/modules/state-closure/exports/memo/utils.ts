// oxlint-disable typescript/no-explicit-any
import { isFunction, isObjectLike } from 'lodash-es';
import { shallowEqual } from 'shallow-equal';

import type { StateMapperComparers } from '.';
import type { OnceFunctionMetadata } from '../once';

import { isClass } from '../../../../utils';
import { isOnceFunction } from '../once/utils';

type ShallowComparable = Record<string, unknown> | unknown[];

export const isShallowEqual = <T>(left: T, right: T): boolean => {
  if (Object.is(left, right)) {
    return true;
  }

  return (
    isObjectLike(left) &&
    isObjectLike(right) &&
    shallowEqual(left as ShallowComparable, right as ShallowComparable)
  );
};

export type StateMapper = ((props: any) => any) & {
  readonly [K in keyof OnceFunctionMetadata]?: never;
};

const mapperComparers = /*#__PURE__*/ Symbol('mapperComparers');

export const withComparers = <M extends StateMapper>(
  mapper: M,
  comparers: StateMapperComparers<Parameters<M>[0], ReturnType<M>>,
): M => {
  if (isClass(mapper) || isOnceFunction(mapper)) {
    throw new TypeError('memo and memoReturns can only be used with mapper functions.');
  }

  return new Proxy(mapper, {
    get(target, key, receiver) {
      return key === mapperComparers ? comparers : Reflect.get(target, key, receiver);
    },
  });
};

export const getMapperComparers = (mapper: unknown): StateMapperComparers | undefined => {
  return isFunction(mapper) ? Reflect.get(mapper, mapperComparers) : undefined;
};
