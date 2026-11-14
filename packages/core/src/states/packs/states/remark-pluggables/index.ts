import type { IPluggable, IRemarkPlugin, RemarkPluginContext } from '@fluxdown/types';

import { PRESET_REMARK_PLUGINS } from '@fluxdown/core-plugins/presets/remark';
import { memoReturns } from 'stative';

import type { RemarkPluggablesInputs } from './type';

import { isPluggablesEqual, toPluggable } from '../../../base';
import { getPluggableClass, getPluggableConfig } from '../utils';

export * from './type';

export const RemarkPluggables = /*#__PURE__*/ memoReturns(function RemarkPluggables({
  config,
  extras,
  repairs,
}: RemarkPluggablesInputs): IPluggable<IRemarkPlugin, unknown>[] {
  const remarks = toPluggable(extras, PRESET_REMARK_PLUGINS);

  const context: RemarkPluginContext = { config, remarks, repairs };

  return remarks.map((pluggable) => [
    getPluggableClass(pluggable),
    getPluggableConfig(pluggable),
    context,
  ]);
}, isPluggablesEqual);
