import type { MapperPluggable } from '@fluxdown/core';
import type { IPluggable, IRehypePlugin, IRemarkPlugin, IRepairPlugin } from '@fluxdown/types';

import type { IReactRenderPluggable } from '../../base/render';
import type { AnySlotPluggable } from '../../base/slot';
import type { PluginConfigs } from './plugins.js';

export interface IPluginItem {
  config?: PluginConfigs;
  remarks?: IPluggable<IRemarkPlugin, unknown>[];
  rehypes?: IPluggable<IRehypePlugin, unknown>[];
  repairs?: IPluggable<IRepairPlugin, unknown>[];
  mappers?: MapperPluggable[];
  renders?: IReactRenderPluggable[];
  slots?: AnySlotPluggable[];
}
