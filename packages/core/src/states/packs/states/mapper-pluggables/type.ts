import type { PluggableConfigs, PluginSet } from '@fluxdown/types';

import type { MapperPluggable } from '../../../base';

export type MapperPluggablesInputs = {
  extras: PluginSet<MapperPluggable, PluggableConfigs<MapperConfigs>>;
};
