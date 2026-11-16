import type {
  IPluggable,
  IRemarkPlugin,
  IRepairPlugin,
  RemarkPluginConfigContext,
  RepairPluginEnabledContext,
} from '@fluxdown/types';

import { PRESET_REMARK_PLUGINS } from '@fluxdown/core-plugins/presets/remark';
import { PRESET_REPAIR_PLUGINS } from '@fluxdown/core-plugins/presets/repair';
import { memoReturns } from 'stative';

import type { RemarkPluggablesInputs } from './type';

import { isPluggablesEqual, PluginBuilder, preparePluggables, toPluggable } from '../../../base';

export * from './type';

export const RemarkPluggables = /*#__PURE__*/ memoReturns(function RemarkPluggables({
  config,
  extras,
  repairs,
  cacheStore,
}: RemarkPluggablesInputs): IPluggable<IRemarkPlugin, unknown>[] {
  const remarks = toPluggable(extras, PRESET_REMARK_PLUGINS);

  const repairSources = config.repair ? toPluggable(repairs, PRESET_REPAIR_PLUGINS) : [];

  const repairContext: RepairPluginEnabledContext = { config, remarks, repairs: repairSources };

  const repairPlugins = PluginBuilder<IRepairPlugin>({
    plugins: preparePluggables(repairSources, repairContext),
    cacheStore,
  });

  const context: RemarkPluginConfigContext = { config, remarks, repairs: repairPlugins };

  return preparePluggables(remarks, context);
}, isPluggablesEqual);
