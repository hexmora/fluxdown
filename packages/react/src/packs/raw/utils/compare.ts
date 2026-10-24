import type { PartialBy } from '@fluxdown/utils';

import { isPropsEqual as isBasePropsEqual } from '@fluxdown/react-base';
import { isEqual } from 'lodash-es';
import { shallowEqual } from 'shallow-equal';

import type { FluxdownRawProps } from '../type';

import { EO } from '../../../consts';

type ComparableProps = PartialBy<FluxdownRawProps, 'plugins'>;

export const isPropsEqual = (left: ComparableProps, right: ComparableProps): boolean => {
  return (
    left === right ||
    (isBasePropsEqual(left, right) &&
      left.className === right.className &&
      shallowEqual(left.style ?? EO, right.style ?? EO) &&
      isEqual(left.theme ?? 'light', right.theme ?? 'light'))
  );
};
