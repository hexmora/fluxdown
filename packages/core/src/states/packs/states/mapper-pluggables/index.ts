import { PRESET_MAPPER_PLUGINS } from '@fluxdown/core-plugins/presets/mapper';
import { isArray } from 'lodash-es';
import { memoReturns } from 'stative';

import type { MapperPluggable } from '../../../base';
import type { MapperPluggablesInputs } from './type';

import { isPluggablesEqual, mergePluginPluggables, toPluggable } from '../../../base';

export * from './type';

export const MapperPluggables = /*#__PURE__*/ memoReturns(function MapperPluggables({
  extras,
}: MapperPluggablesInputs): MapperPluggable[] {
  const plugins = toPluggable(extras);

  const defaults = PRESET_MAPPER_PLUGINS.filter(
    (Plugin) => !plugins.some((item) => (isArray(item) ? item[0] : item) === Plugin),
  );

  return mergePluginPluggables([], toPluggable(extras, defaults));
}, isPluggablesEqual);
