import type { IPluggable, IRehypePlugin } from '@fluxdown/types';

import { PRESET_REHYPE_PLUGINS, RehypePluginKeys } from '@fluxdown/core-plugins/presets/rehype';
import { memoReturns } from 'stative';

import type { RehypePluggablesInputs } from './type';

import { isPluggablesEqual, toPluggable } from '../../../base';
import { getPluggableClass } from '../utils';

export * from './type';

export const RehypePluggables = /*#__PURE__*/ memoReturns(function RehypePluggables({
  config,
  extras,
}: RehypePluggablesInputs): IPluggable<IRehypePlugin, unknown>[] {
  return toPluggable(extras, PRESET_REHYPE_PLUGINS).filter(
    (pluggable) =>
      getPluggableClass(pluggable).key !== RehypePluginKeys.HoistFootnote || config.footnote,
  );
}, isPluggablesEqual);
