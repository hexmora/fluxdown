import type { MapperPluggable } from '@fluxdown/core';
import type { IPluggable, IRehypePlugin, IRemarkPlugin, IRepairPlugin } from '@fluxdown/types';

import type { IAngularRenderPluggable } from '../render';
import type { AnySlotPluggable } from '../slot';
import type { PluginConfigs } from './plugins';

export interface IPluginItem {
  config?: PluginConfigs;

  remarks?: IPluggable<IRemarkPlugin, unknown>[];

  rehypes?: IPluggable<IRehypePlugin, unknown>[];

  repairs?: IPluggable<IRepairPlugin, unknown>[];

  mappers?: MapperPluggable[];

  renders?: IAngularRenderPluggable[];

  slots?: AnySlotPluggable[];
}
