import type { Distinctor, IReactiveState } from 'stative';

import { assert } from '@fluxdown/utils';
import {
  useCallback,
  useDebugValue,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import { MutableState } from 'stative';

import { useDeferredUnmount, useStatic } from './base';

type StoreChangeFunction = () => void;

type StateSelector<T, S> = (value: T) => S;

type StateValueArgument<T, S> = StateSelector<T, S> | Distinctor<S>;

type StateValueInstance<T> = {
  value: T;
};

let deferDepth = 0;

let flushScheduled = false;

let pendingStoreChanges: StoreChangeFunction[] = [];

const selectStateValue = <T>(value: T): T => value;

const isStateSelector = <T, S>(value: StateValueArgument<T, S>): value is StateSelector<T, S> =>
  value.length < 2;

const flushStoreChanges = () => {
  flushScheduled = false;

  const storeChanges = pendingStoreChanges;

  pendingStoreChanges = [];

  for (const storeChange of storeChanges) {
    storeChange();
  }
};

const scheduleStoreChange = (storeChange: StoreChangeFunction) => {
  if (!pendingStoreChanges.includes(storeChange)) {
    pendingStoreChanges.push(storeChange);
  }

  if (flushScheduled) {
    return;
  }

  flushScheduled = true;

  queueMicrotask(flushStoreChanges);
};

const notifyStoreChange = (storeChange: StoreChangeFunction) => {
  if (deferDepth > 0) {
    scheduleStoreChange(storeChange);

    return;
  }

  storeChange();
};

const deferStoreChanges = (update: () => void) => {
  deferDepth += 1;

  try {
    update();
  } finally {
    deferDepth -= 1;
  }
};

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

const useStateSubscribe = <T>(state: IReactiveState<T>) =>
  useCallback(
    (onStoreChange: () => void) => {
      let active = false;

      const notify = () => {
        if (active) {
          onStoreChange();
        }
      };

      const subscription = state.subscribe(() => {
        if (!active) {
          return;
        }

        notifyStoreChange(notify);
      });

      active = true;

      return () => {
        active = false;

        subscription.unsubscribe();
      };
    },
    [state],
  );

/**

 * Selectors declare at most one parameter; distinctors declare two required parameters.

 */
export function useStateValue<T>(state: IReactiveState<T>): T;

export function useStateValue<T, S>(
  state: IReactiveState<T>,
  selector: StateSelector<T, S>,
  distinctor: Distinctor<S>,
): S;

export function useStateValue<T, S>(state: IReactiveState<T>, selector: StateSelector<T, S>): S;

export function useStateValue<T>(state: IReactiveState<T>, distinctor: Distinctor<T>): T;

export function useStateValue<T, S = T>(
  state: IReactiveState<T>,
  selectorOrDistinctor?: StateValueArgument<T, S>,
  selectionDistinctor?: Distinctor<S>,
): S {
  const subscribe = useStateSubscribe(state);

  let selector: StateSelector<T, S>;

  let distinctor: Distinctor<S>;

  if (selectorOrDistinctor !== undefined && isStateSelector(selectorOrDistinctor)) {
    selector = selectorOrDistinctor;

    distinctor = selectionDistinctor ?? Object.is;
  } else {
    assert(
      selectionDistinctor === undefined,
      'useStateValue requires a selector before a selection distinctor.',
    );

    selector = selectStateValue as unknown as StateSelector<T, S>;

    distinctor = selectorOrDistinctor ?? Object.is;
  }

  const valueRef = useRef<StateValueInstance<S> | null>(null);

  const getSelection = useMemo(() => {
    if (selector === selectStateValue && distinctor === Object.is) {
      return () => selector(state.value);
    }

    let hasSelection = false;

    let nextSnapshot: T;

    let nextSelection: S;

    return () => {
      const snapshot = state.value;

      if (!hasSelection) {
        hasSelection = true;

        nextSnapshot = snapshot;

        const selection = selector(snapshot);

        const instance = valueRef.current;

        if (instance && distinctor(instance.value, selection)) {
          nextSelection = instance.value;

          return nextSelection;
        }

        nextSelection = selection;

        return nextSelection;
      }

      if (nextSnapshot === snapshot) {
        return nextSelection;
      }

      const selection = selector(snapshot);

      const equal = distinctor(nextSelection, selection);

      nextSnapshot = snapshot;

      if (equal) {
        return nextSelection;
      }

      nextSelection = selection;

      return nextSelection;
    };
  }, [distinctor, selector, state]);

  const selection = useSyncExternalStore(subscribe, getSelection, getSelection);

  // Record only committed selections; render-time writes can leak from abandoned renders.
  useEffect(() => {
    if (valueRef.current) {
      valueRef.current.value = selection;
    } else {
      valueRef.current = { value: selection };
    }
  }, [selection]);

  useDebugValue(selection);

  return selection;
}
