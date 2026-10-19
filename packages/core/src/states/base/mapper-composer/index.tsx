/**
 * @jsxImportSource stative
 */

import type { IBlockState } from '@fluxdown/types';

import { PluginPriority } from '@fluxdown/types';
import { first, isArray, sortBy } from 'lodash-es';
import { D, type IReadableClosure, once, useMap, useSwitchMap } from 'stative';

import type { HastRoot } from '../../../typings';
import type { Mapper, MapperComposerInputs } from './type';

import { isPluggableEnabled, isPluggablesEqual } from '../plugin-builder';
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

  const current = useMap(mappers, (items): Mapper | undefined => {
    const pluggable = first(items);

    return isArray(pluggable) ? pluggable[0] : pluggable;
  });

  return useSwitchMap(current, (mapper) => {
    if (!mapper) {
      return source;
    }

    return <MapperItem mapper={D(mapper)} mappers={mappers} source={source} />;
  });
});
