import type { Comparable } from '@fluxdown/lynx-plugins/base';
import type { Context, FC, PropsWithChildren } from '@lynx-js/react';

import { useMemoValue } from '@fluxdown/lynx-plugins/base';
import { createElement } from '@lynx-js/react';
import { shallowEqual } from 'shallow-equal';

export const createShallowedProvider = <T extends Comparable>(context: Context<T>) => {
  const ContextProvider = context.Provider;

  const TargetProvider: FC<PropsWithChildren<{ value: T }>> = ({ value, children }) => {
    const memoedValue = useMemoValue(value, shallowEqual);

    return createElement(ContextProvider, { value: memoedValue }, children);
  };

  return TargetProvider;
};
