import type { Accessor } from 'solid-js';
import type { IReactiveState } from 'stative';

import { createComputed, createSignal, onCleanup, untrack } from 'solid-js';

export const createStateValue = <T>(
  source: IReactiveState<T> | Accessor<IReactiveState<T>>,
): Accessor<T> => {
  const getState = () => (typeof source === 'function' ? source() : source);

  const [value, setValue] = createSignal(untrack(getState).value);

  createComputed(() => {
    const state = getState();

    setValue(() => state.value);

    const subscription = state.subscribe(() => setValue(() => state.value));

    onCleanup(() => subscription.unsubscribe());
  });

  return value;
};
