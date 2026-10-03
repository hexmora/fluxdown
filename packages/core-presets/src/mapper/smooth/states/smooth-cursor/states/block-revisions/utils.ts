import type { IBlockState } from '@fluxdown/types';
import type { IReadableClosure } from 'stative';

import { mapClosure } from 'stative';

import type { BlockRevision } from './type';

export const createBlockRevision = <T>({
  baseLength,
  prevPrefixLength,
}: IBlockState<T>): IReadableClosure<BlockRevision> => {
  return prevPrefixLength
    ? mapClosure(prevPrefixLength, () => ({
        length: baseLength.value,
        prefixLength: prevPrefixLength.value,
      }))
    : mapClosure(baseLength, (length) => ({ length, prefixLength: Infinity }));
};
