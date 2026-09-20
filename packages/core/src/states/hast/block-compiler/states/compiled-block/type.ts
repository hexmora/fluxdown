import type { IReadableClosure } from 'stative';

import type { BlockCompilerInputs, BlockCompilerItem } from '../../type';

export type CompiledBlockInputs = Pick<
  BlockCompilerInputs,
  'config' | 'getRemarks' | 'getRehypes'
> & {
  item: IReadableClosure<BlockCompilerItem>;

  key: string;
};
