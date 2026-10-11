import type { IRehypePlugin, IRemarkPlugin } from '@fluxdown/types';
import type { IReadableClosure } from 'stative';

import type { BlockRemarksConfig } from '../../../../../../../hast';
import type { DocumentPlugins } from '../../../../../document-plugins';

export type BlockPluginsInputs = {
  settings: IReadableClosure<BlockRemarksConfig>;

  plugins: DocumentPlugins;

  remarks: IReadableClosure<IRemarkPlugin[]>;

  rehypes: IReadableClosure<IRehypePlugin[]>;
};
