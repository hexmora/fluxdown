import type { Accessor } from 'solid-js';
import type { Distinctor, IReactiveState } from 'stative';

import { createComputed, onCleanup, untrack } from 'solid-js';
import { MutableState } from 'stative';

export const createStateOf = <T>(
  source: Accessor<T>,
  distinctor: Distinctor<T> = Object.is,
): IReactiveState<T> => {
  const state = new MutableState({ initial: untrack(source), distinctor });

  createComputed(() => state.next(source()));

  onCleanup(() => state.destroy());

  return state;
};
