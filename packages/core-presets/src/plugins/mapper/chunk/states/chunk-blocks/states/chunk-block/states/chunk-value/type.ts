import type { IBlockState } from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

import type { ChunkBlockInputs } from '../../type';

export interface ChunkValueInputs extends ChunkBlockInputs {
  current: IBlockState<HastRoot>;
}
