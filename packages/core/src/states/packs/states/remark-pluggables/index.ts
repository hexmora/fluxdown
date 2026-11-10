import type {
  IPluggable,
  IRemarkPlugin,
  IRepairPlugin,
  RemarkPluginConfigContext,
  RemarkPluginEnabledContext,
  RepairPluginEnabledContext,
} from '@fluxdown/types';

import { PRESET_REMARK_PLUGINS } from '@fluxdown/core-plugins/presets/remark';
import { PRESET_REPAIR_PLUGINS } from '@fluxdown/core-plugins/presets/repair';
import { memoReturns } from 'stative';

import type { RemarkPluggablesInputs } from './type';

import { isPluggableEnabled, isPluggablesEqual, PluginBuilder, toPluggable } from '../../../base';
import { getPluggableClass, getPluggableConfig } from '../utils';

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

  const repairPluggables = repairSources
    .filter(isPluggableEnabled)
    .map((pluggable): IPluggable<IRepairPlugin, unknown> => {
      const Plugin = getPluggableClass(pluggable);

      const options = Plugin.config(repairContext, getPluggableConfig(pluggable));

      return options === null ? pluggable : [Plugin, options];
    });

  const repairCandidates = PluginBuilder<IRepairPlugin>({
    plugins: repairPluggables,
    cacheStore,
  });

  const repairPlugins = repairCandidates.filter((plugin) => plugin.enabled(repairContext));

  const configContext: RemarkPluginConfigContext = { config, remarks, repairs: repairPlugins };

  const pluggables = remarks
    .filter(isPluggableEnabled)
    .map((pluggable): IPluggable<IRemarkPlugin, unknown> => {
      const Plugin = getPluggableClass(pluggable);

      const options = Plugin.config(configContext, getPluggableConfig(pluggable));

      return options === null ? pluggable : [Plugin, options];
    })
    .filter(isPluggableEnabled);

  const candidates = PluginBuilder<IRemarkPlugin>({ plugins: pluggables, cacheStore, sort: false });

  const context: RemarkPluginEnabledContext = { config, remarks };

  const enabled = candidates.map((plugin) => plugin.enabled(context));

  return pluggables.filter((_pluggable, index) => enabled[index]);
}, isPluggablesEqual);
