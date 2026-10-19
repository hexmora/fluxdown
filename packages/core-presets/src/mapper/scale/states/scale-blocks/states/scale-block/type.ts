import type { IBlockState } from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

import type { ScaleAnimationInputs } from '../../type';

export interface ScaleBlockInputs extends ScaleAnimationInputs {
  source: IBlockState<HastRoot>;

  initial: boolean;
}
