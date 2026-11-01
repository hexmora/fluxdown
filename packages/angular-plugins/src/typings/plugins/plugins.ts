import type { PluggableConfigs } from '@fluxdown/types';

export type PluginConfigs = PluggableConfigs<MapperConfigs> &
  Partial<
    RemarkConfigs & RehypeConfigs & RepairConfigs & AngularRenderConfigs & AngularSlotConfigs
  >;
