import type { IBlockMeta } from '@fluxdown/types';
import type { StateMapper } from 'stative';

import { eq, isEqual } from 'lodash-es';

import type { BlockCompilerConfig, BlockCompilerItem, BlockRemarksConfig } from '../../type';

export const isMetaEqual = (value: IBlockMeta, other: IBlockMeta): boolean => {
  return eq(value.blockCount, other.blockCount) && isEqual(value, other);
};

export const getRemarksConfig: StateMapper<
  [BlockCompilerConfig, BlockCompilerItem],
  BlockRemarksConfig
> = ([config, item], previous) => {
  const { patches } = item.section;

  if (previous && previous[0][0] === config && isEqual(previous[1].patches, patches)) {
    if (previous[0][1].isLast === item.isLast) {
      return previous[1];
    }

    if (!item.isLast) {
      return previous[1].repairEnding ? { ...previous[1], repairEnding: false } : previous[1];
    }
  }

  const { repairEnding, ...restConfig } = config;

  return { ...restConfig, repairEnding: repairEnding && item.isLast, patches };
};
