import type { IBlockState } from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';
import type { IReadableClosure } from 'stative';

import type { ChunkAnimationInputs } from '../../type';

export interface ChunkBlockInputs extends ChunkAnimationInputs {
  source: IBlockState<HastRoot>;

  initial: boolean;

  clock: IReadableClosure<number>;
}
