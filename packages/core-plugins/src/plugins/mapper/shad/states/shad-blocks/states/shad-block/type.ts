import type { IBlockState } from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';
import type { IReadableClosure } from 'stative';

import type { FadeConcurrency } from '../../../../utils';
import type { ShadAnimationInputs } from '../../type';

export interface ShadBlockInputs extends ShadAnimationInputs {
  source: IBlockState<HastRoot>;

  initial: boolean;

  clock: IReadableClosure<number>;

  concurrency: FadeConcurrency;
}
