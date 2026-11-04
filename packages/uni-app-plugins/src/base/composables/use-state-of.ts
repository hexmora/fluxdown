import type { Distinctor, IReactiveState } from 'stative';

import { MutableState } from 'stative';
import { onScopeDispose, watch } from 'vue';

export const useStateOf = <T>(
  source: () => T,
  distinctor: Distinctor<T> = Object.is,
): IReactiveState<T> => {
  const state = new MutableState({ initial: source(), distinctor });

  watch(source, (value) => state.next(value), { flush: 'sync' });

  onScopeDispose(() => state.destroy());

  return state;
};
