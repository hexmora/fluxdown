import type { IBlockMeta, IBlockState, IBlockStateMapper, IRangeState } from '@fluxdown/types';
import type { Newable } from '@fluxdown/utils';
import type { IReadableClosure } from 'stative';

export type BaseBlockItemInputs<T> = {
  source: IReadableClosure<T>;

  meta: IReadableClosure<IBlockMeta>;

  range?: IReadableClosure<IRangeState | null>;

  mapper?: IBlockStateMapper<T>;
};

export type BlockItemClass<T> = Newable<IBlockState<T>, [BaseBlockItemInputs<T>]>;
