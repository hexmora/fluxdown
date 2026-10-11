import type { IReadableClosure } from 'stative';

import type { BlockContentInputs } from '..';
import type { HastRoot } from '../../../../../../../typings';

export type CompiledBlockResultInputs = Pick<BlockContentInputs, 'item' | 'count' | 'key'> & {
  source: IReadableClosure<HastRoot>;
};
