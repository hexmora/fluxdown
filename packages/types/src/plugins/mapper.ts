import type { Root as HastRoot } from 'hast';
import type { IReadableClosure } from 'stative';

import type { IBlockState } from '../block';

export type MapperInputs<C = {}, T = IBlockState<HastRoot>[]> = C & {
  source: IReadableClosure<T>;
};
