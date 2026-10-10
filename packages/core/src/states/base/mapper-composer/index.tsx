/**
 * @jsxImportSource stative
 */

import type { IBlockState } from '@fluxdown/types';

import { PluginPriority } from '@fluxdown/types';
import { first, isArray, sortBy } from 'lodash-es';
import { D, type IReadableClosure, once, useMap, useSwitchMap } from 'stative';

import type { HastRoot } from '../../../typings';
import type { Mapper, MapperComposerInputs } from './type';

import { isPluggableEnabled, isPluggableEqual, isPluggablesEqual } from '../plugin-builder';
import { MapperItem } from './states';

export * from './type';

export const MapperComposer = /*#__PURE__*/ once(function MapperComposer({
  mappers: _mappers,
  source,
}: MapperComposerInputs): IReadableClosure<IBlockState<HastRoot>[]> {
  const mappers = useMap(
    _mappers,
    (items) =>
      sortBy(items.filter(isPluggableEnabled), (item) =>
        isArray(item) ? (item[1].priority ?? PluginPriority.Default) : PluginPriority.Default,
      ),
    isPluggablesEqual,
  );

  const current = useMap(mappers, (items) => first(items), isPluggableEqual);

  return useSwitchMap(current, (pluggable) => {
    if (!pluggable) {
      return source;
    }

    const mapper: [Mapper, object | undefined] = isArray(pluggable)
      ? pluggable
      : [pluggable, undefined];

    return <MapperItem mapper={D(mapper)} mappers={mappers} source={source} />;
  });
});
