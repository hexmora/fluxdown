import type { CompilerConfig, PluggableConfigs, PluginSet } from '@fluxdown/types';

import type { MapperPluggable } from '../../../base';

export type MapperPluggablesInputs = {
  config: CompilerConfig;

  extras: PluginSet<MapperPluggable, PluggableConfigs<MapperConfigs>>;
};

export interface MapperPluginContext {
  config: CompilerConfig;

  mappers: MapperPluggable[];
}
