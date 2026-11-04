import type { MapperPluggable } from '@fluxdown/core';
import type { IPluggable, IRehypePlugin, IRemarkPlugin, IRepairPlugin } from '@fluxdown/types';

import type { IVueRenderPluggable } from '../../base/render';
import type { AnySlotPluggable } from '../../base/slot';
import type { PluginConfigs } from './plugins.js';

export interface IPluginItem<Config extends object = PluginConfigs> {
  config?: Config;
  remarks?: IPluggable<IRemarkPlugin, unknown>[];
  rehypes?: IPluggable<IRehypePlugin, unknown>[];
  repairs?: IPluggable<IRepairPlugin, unknown>[];
  mappers?: MapperPluggable[];
  renders?: IVueRenderPluggable[];
  slots?: AnySlotPluggable[];
}
