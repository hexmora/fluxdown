import type { Distinctor } from '../../../reactive-state';

import { isShallowEqual, type StateMapper, withComparers } from './utils';
// oxlint-disable typescript/no-explicit-any

export type StateMapperComparers<T = unknown, R = unknown> = {
  inputs?: Distinctor<T>;

  returns: Distinctor<R>;
};

/** Skips equal mapper inputs and filters equal return values, per rendered closure. */
export const memo = <M extends StateMapper>(
  mapper: M,
  inputs: Distinctor<Parameters<M>[0]> = isShallowEqual,
  returns: Distinctor<ReturnType<M>> = Object.is,
): M => withComparers(mapper, { inputs, returns });

/** Filters return values without skipping mapper calls. */
export const memoReturns = <M extends StateMapper>(
  mapper: M,
  returns: Distinctor<ReturnType<M>> = Object.is,
): M => withComparers(mapper, { returns });
