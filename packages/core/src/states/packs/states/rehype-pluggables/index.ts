import type { IPluggable, IRehypePlugin } from '@fluxdown/types';

import { HoistFootnoteRehypePlugin } from '@fluxdown/core-presets/plugins/rehype/hoist-footnote';
import { PRESET_REHYPE_PLUGINS } from '@fluxdown/core-presets/presets/rehype';
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
    (pluggable) => getPluggableClass(pluggable) !== HoistFootnoteRehypePlugin || config.footnote,
  );
}, isPluggablesEqual);
