import type { IReactiveState } from 'stative';
import type { ShallowRef } from 'vue';

import { shallowRef, watch } from 'vue';

export const useStateValue = <T>(
  source: IReactiveState<T> | (() => IReactiveState<T>),
): ShallowRef<T> => {
  const getState = () => (typeof source === 'function' ? source() : source);

  const value = shallowRef(getState().value);

  watch(
    getState,
    (state, _, onCleanup) => {
      value.value = state.value;

      const subscription = state.subscribe(() => {
        value.value = state.value;
      });

      onCleanup(() => subscription.unsubscribe());
    },
    { immediate: true, flush: 'sync' },
  );

  return value;
};
