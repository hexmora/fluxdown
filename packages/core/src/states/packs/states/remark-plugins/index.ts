import type { IRemarkPlugin, IRepairPlugin } from '@fluxdown/types';

import { shallowEqual } from 'shallow-equal';
import { memoReturns } from 'stative';

import type { RemarkPluginsInputs } from './type';

import { RemarkPluggables } from '..';
import { PluginBuilder } from '../../../base';

export * from './type';

export const RemarkPlugins = /*#__PURE__*/ memoReturns(function RemarkPlugins({
  config,
  extras,
  repairs,
  cacheStore,
}: RemarkPluginsInputs): IRemarkPlugin[] {
  const repairPlugins = PluginBuilder<IRepairPlugin>({ plugins: repairs, cacheStore });

  const plugins = RemarkPluggables({ config, extras, repairs: repairPlugins });

  return PluginBuilder<IRemarkPlugin>({ plugins, cacheStore });
}, shallowEqual);
