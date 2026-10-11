import type { IBlockMeta } from '@fluxdown/types';

import { eq, isEqual } from 'lodash-es';

export const isMetaEqual = (value: IBlockMeta, other: IBlockMeta): boolean => {
  return eq(value.blockCount, other.blockCount) && isEqual(value, other);
};
