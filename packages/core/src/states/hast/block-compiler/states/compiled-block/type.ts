import type { IBlockRawMeta } from '@fluxdown/types';
import type { IReadableClosure } from 'stative';

import type { IBlockSection } from '../../../../base';
import type { BlockCompilerInputs } from '../../type';

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
