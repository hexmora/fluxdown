import type { IReactiveState } from 'stative';

import { fromStore } from 'svelte/store';

export const fromState = <T>(source: IReactiveState<T>) => {
  return fromStore({
    subscribe(run: (value: T) => void) {
      run(source.value);

      const subscription = source.subscribe(run);

      return () => subscription.unsubscribe();
    },
  });
};
