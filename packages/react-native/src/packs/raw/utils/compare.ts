import type { PartialBy } from '@fluxdown/utils';

import { isPropsEqual as isBasePropsEqual } from '@fluxdown/react-base';
import { isEqual } from 'lodash-es';

import type { FluxdownRawProps } from '../type';

type ComparableProps = PartialBy<FluxdownRawProps, 'plugins'>;

export const isPropsEqual = (left: ComparableProps, right: ComparableProps): boolean => {
  return (
    left === right ||
    (isBasePropsEqual(left, right) &&
      isEqual(left.style, right.style) &&
      isEqual(left.theme ?? 'light', right.theme ?? 'light'))
  );
};
