import { shallowEqual } from 'shallow-equal';

import type { RootReconcilerProps } from './type';

import { EO } from '../../consts';

export const isPropsEqual = (
  previous: RootReconcilerProps,
  current: RootReconcilerProps,
): boolean => {
  return (
    previous.children === current.children &&
    previous.className === current.className &&
    shallowEqual(previous.style ?? EO, current.style ?? EO)
  );
};
