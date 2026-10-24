import type { IReactiveState } from 'stative';

import { useCallback } from 'react';

import { notifyStoreChange } from './store-changes';

export const useStateSubscribe = <T>(state: IReactiveState<T>) =>
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
