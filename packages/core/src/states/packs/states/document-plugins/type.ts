import type {
  IPluggable,
  IRehypePlugin,
  IRemarkPlugin,
  IRepairPlugin,
  PluginSet,
} from '@fluxdown/types';
import type { IReadableClosure } from 'stative';

import type { BlockCompilerConfig } from '../../../hast';

export type RemarkPluginSet = PluginSet<IPluggable<IRemarkPlugin, unknown>, RemarkConfigs>;

export type RehypePluginSet = PluginSet<IPluggable<IRehypePlugin, unknown>, RehypeConfigs>;

export type RepairPluginSet = PluginSet<IPluggable<IRepairPlugin, unknown>, RepairConfigs>;

export type DocumentPluginsInputs = {
  config: IReadableClosure<BlockCompilerConfig>;

  remarks: IReadableClosure<RemarkPluginSet>;

  rehypes: IReadableClosure<RehypePluginSet>;

  repairs: IReadableClosure<RepairPluginSet>;
};

export type DocumentPluginSources = {
  sealed: IReadableClosure<IRemarkPlugin[]> | null;

  ending: IReadableClosure<IRemarkPlugin[]> | null;

  rehypes: IReadableClosure<IRehypePlugin[]> | null;
};
