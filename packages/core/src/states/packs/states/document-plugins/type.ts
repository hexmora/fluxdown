import type {
  IPluggable,
  IRehypePlugin,
  IRemarkPlugin,
  IRepairPlugin,
  PluginSet,
} from '@fluxdown/types';
import type { IReadableClosure } from 'stative';

import type { BlockCompilerConfig, BlockRemarksConfig } from '../../../hast';
import type { DocumentPlugins } from './index';

export type DocumentPluginsInputs = {
  config: IReadableClosure<BlockCompilerConfig>;

  remarks: IReadableClosure<PluginSet<IPluggable<IRemarkPlugin, unknown>, RemarkConfigs>>;

  rehypes: IReadableClosure<PluginSet<IPluggable<IRehypePlugin, unknown>, RehypeConfigs>>;

  repairs: IReadableClosure<PluginSet<IPluggable<IRepairPlugin, unknown>, RepairConfigs>>;
};

export type DocumentPluginSources = {
  sealed: IReadableClosure<IRemarkPlugin[]>;

  ending: IReadableClosure<IRemarkPlugin[]>;

  rehypes: IReadableClosure<IRehypePlugin[]>;

  shareRemarks: boolean;

  shareRehypes: boolean;
};

export type RemarkScopeInputs = {
  provider: DocumentPlugins;

  config: IReadableClosure<BlockRemarksConfig>;
};

export type RehypeScopeInputs = Omit<RemarkScopeInputs, 'config'>;
