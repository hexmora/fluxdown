import type { IBlockState } from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';
import type { IReadableClosure } from 'stative';

export interface ShadProgressInputs {
  source: IReadableClosure<IBlockState<HastRoot>[]>;

  enabled: IReadableClosure<boolean>;

  length: IReadableClosure<number>;
}

export interface ShadPosition {
  length: number;

  activeLength: number;
}
