import type { IBlockState } from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

import type { ScaleBlockInputs } from '../../type';

export interface ScaleValueInputs extends ScaleBlockInputs {
  current: IBlockState<HastRoot>;
}
