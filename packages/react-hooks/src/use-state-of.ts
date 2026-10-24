import type { Distinctor, IReactiveState } from 'stative';

import { useEffect, useRef } from 'react';
import { MutableState } from 'stative';

import { useDeferredUnmount } from './use-deferred-unmount';
import { useStatic } from './use-static';
import { deferStoreChanges, flushStoreChanges } from './utils';

export const useStateOf = <T>(
  value: T,
  distinctor: Distinctor<T> = Object.is,
): IReactiveState<T> => {
  const distinctorRef = useRef(distinctor);

  distinctorRef.current = distinctor;

  const state = useStatic(
    () =>
      new MutableState({
        initial: value,
        distinctor: (from, to) => distinctorRef.current(from, to),
      }),
  );

  useEffect(flushStoreChanges);

  if (!distinctorRef.current(state.value, value)) {
    deferStoreChanges(() => state.next(value));
  }

  useDeferredUnmount(() => state.destroy());

  return state;
};
