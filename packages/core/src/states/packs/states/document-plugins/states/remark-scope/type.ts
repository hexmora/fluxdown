import type { IReadableClosure } from 'stative';

import type { DocumentPlugins } from '../..';
import type { BlockRemarksConfig } from '../../../../../hast';

export type RemarkScopeInputs = {
  provider: DocumentPlugins;

  config: IReadableClosure<BlockRemarksConfig>;
};
