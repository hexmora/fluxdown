import type { IBlockRawMeta } from '@fluxdown/types';
import type { IReadableClosure } from 'stative';

import type { IBlockSection } from '../../../../base';
import type { BlockCompilerInputs, BlockCompilerItem } from '../../type';

export type CompiledBlockInputs = Pick<
  BlockCompilerInputs,
  'config' | 'getRemarks' | 'getRehypes'
> & {
  section: IReadableClosure<IBlockSection>;

  meta: IReadableClosure<IBlockRawMeta>;

  isLast: IReadableClosure<boolean>;

  count: IReadableClosure<number>;

  key: string;
};

export type CompiledBlockContentInputs = Omit<
  CompiledBlockInputs,
  'section' | 'meta' | 'isLast'
> & {
  item: IReadableClosure<BlockCompilerItem>;

  idPrefix: IReadableClosure<string | undefined>;
};
