import type { MapperPluggable } from '@fluxdown/core';
import type {
  IPluggable,
  IRehypePlugin,
  IRemarkPlugin,
  IRepairPlugin,
  PluggableConfigs,
} from '@fluxdown/types';

import type { AnySlotPluggable, IReactRenderPluggable } from '../base';

export type PluginConfigs = PluggableConfigs<MapperConfigs> &
  Partial<RemarkConfigs & RehypeConfigs & RepairConfigs & RenderConfigs & SlotConfigs>;

export interface IPluginItem {
  config?: PluginConfigs;
  remarks?: IPluggable<IRemarkPlugin, unknown>[];
  rehypes?: IPluggable<IRehypePlugin, unknown>[];
  repairs?: IPluggable<IRepairPlugin, unknown>[];
  mappers?: MapperPluggable[];
  renders?: IReactRenderPluggable[];
  slots?: AnySlotPluggable[];
}
