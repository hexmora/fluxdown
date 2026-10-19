import type { Root as HastRoot } from 'hast';
import type { IReadableClosure } from 'stative';

import type { IBlockState } from '../block';

export type MapperInputs<C = {}, T = IBlockState<HastRoot>[]> = C & {
  source: IReadableClosure<T>;
};

/** Reactive inputs derived from a mapper's plain configuration fields. */
export type MapperConfigInputs<C> = {
  [K in keyof C]: IReadableClosure<C[K]>;
};

/** Public mapper configuration accepts plain values and readable closures. */
export type MapperPluginConfig<C> = {
  [K in keyof C]: C[K] | IReadableClosure<C[K]>;
};
