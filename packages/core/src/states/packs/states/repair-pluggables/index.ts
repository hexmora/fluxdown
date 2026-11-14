import type { IPluggable, IRepairPlugin, RepairPluginContext } from '@fluxdown/types';

import { PRESET_REMARK_PLUGINS } from '@fluxdown/core-plugins/presets/remark';
import { PRESET_REPAIR_PLUGINS } from '@fluxdown/core-plugins/presets/repair';
import { memoReturns } from 'stative';

import type { RepairPluggablesInputs } from './type';

import { isPluggablesEqual, toPluggable } from '../../../base';
import { getPluggableClass, getPluggableConfig } from '../utils';

export * from './type';

export const RepairPluggables = /*#__PURE__*/ memoReturns(function RepairPluggables({
  config,
  extras,
  remarks = {},
}: RepairPluggablesInputs): IPluggable<IRepairPlugin, unknown>[] {
  if (!config.repair) {
    return [];
  }

  const repairs = toPluggable(extras, PRESET_REPAIR_PLUGINS);

  const context: RepairPluginContext = {
    config,
    remarks: toPluggable(remarks, PRESET_REMARK_PLUGINS),
    repairs,
  };

  return repairs.map((pluggable) => [
    getPluggableClass(pluggable),
    getPluggableConfig(pluggable),
    context,
  ]);
}, isPluggablesEqual);
