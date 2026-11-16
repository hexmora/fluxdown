import type { IRemarkPlugin } from '@fluxdown/types';

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
  const plugins = RemarkPluggables({ config, extras, repairs, cacheStore });

  return PluginBuilder<IRemarkPlugin>({ plugins, cacheStore });
}, shallowEqual);
