import type { Comparable } from '@fluxdown/react-hooks';
import type { Context, FC, PropsWithChildren } from 'react';

import { useMemoValue } from '@fluxdown/react-hooks';
import { createElement } from 'react';
import { shallowEqual } from 'shallow-equal';

export const createShallowedProvider = <T extends Comparable>(context: Context<T>) => {
  const ContextProvider = context.Provider;

  const TargetProvider: FC<PropsWithChildren<{ value: T }>> = ({ value, children }) => {
    const memoedValue = useMemoValue(value, shallowEqual);

    return createElement(ContextProvider, { value: memoedValue }, children);
  };

  return TargetProvider;
};
