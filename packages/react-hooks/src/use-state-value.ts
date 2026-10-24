import type { Distinctor, IReactiveState } from 'stative';

import { assert } from '@fluxdown/utils';
import { useDebugValue, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

import { useStateSubscribe } from './utils';

type StateSelector<T, S> = (value: T) => S;

type StateValueArgument<T, S> = StateSelector<T, S> | Distinctor<S>;

type StateValueInstance<T> = {
  value: T;
};

const selectStateValue = <T>(value: T): T => value;

const isStateSelector = <T, S>(value: StateValueArgument<T, S>): value is StateSelector<T, S> =>
  value.length < 2;

/** Selectors declare at most one parameter; distinctors declare two required parameters. */
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
