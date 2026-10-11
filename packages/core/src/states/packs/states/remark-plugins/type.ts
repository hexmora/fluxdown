import type { IPluggable, IRemarkPlugin, IRepairPlugin, PluginSet } from '@fluxdown/types';

import type { PluginCacheStore } from '../../../base';
import type { BlockRemarksConfig } from '../../../hast';

export type RemarkPluginsInputs = {
  config: BlockRemarksConfig;

  extras: PluginSet<IPluggable<IRemarkPlugin, unknown>, RemarkConfigs>;

  repairs: IPluggable<IRepairPlugin, unknown>[];

  cacheStore: PluginCacheStore;
};
