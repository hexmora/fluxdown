import type { PluggableConfigs } from '@fluxdown/types';

import '@fluxdown/react-presets/render';
import '@fluxdown/react-presets/slot';

export type PluginConfigs = PluggableConfigs<MapperConfigs> &
  RemarkConfigs &
  RehypeConfigs &
  RepairConfigs &
  RenderConfigs &
  SlotConfigs;
