import type { IReadableClosure } from 'stative';

import type { BlockCompilerItem } from '../../../../type';
import type { CompiledBlockInputs } from '../../type';

export type CompiledBlockContentInputs = Omit<
  CompiledBlockInputs,
  'section' | 'meta' | 'isLast'
> & {
  item: IReadableClosure<BlockCompilerItem>;

  idPrefix: IReadableClosure<string | undefined>;
};
