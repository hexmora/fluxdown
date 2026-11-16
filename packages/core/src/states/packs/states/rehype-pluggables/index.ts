import type { IPluggable, IRehypePlugin, RehypePluginContext } from '@fluxdown/types';

import { PRESET_REHYPE_PLUGINS } from '@fluxdown/core-plugins/presets/rehype';
import { memoReturns } from 'stative';

import type { RehypePluggablesInputs } from './type';

import { isPluggablesEqual, preparePluggables, toPluggable } from '../../../base';

export * from './type';

export const RehypePluggables = /*#__PURE__*/ memoReturns(function RehypePluggables({
  config,
  extras,
}: RehypePluggablesInputs): IPluggable<IRehypePlugin, unknown>[] {
  const rehypes = toPluggable(extras, PRESET_REHYPE_PLUGINS);

  const context: RehypePluginContext = { config, rehypes };

  return preparePluggables(rehypes, context);
}, isPluggablesEqual);
