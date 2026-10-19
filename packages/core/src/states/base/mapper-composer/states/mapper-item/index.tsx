/** @jsxImportSource stative */

import type { IBlockState } from '@fluxdown/types';
import type { JSXDescriptor } from 'stative';

import { first, isArray, tail } from 'lodash-es';
import { once, useMap } from 'stative';

import type { HastRoot } from '../../../../../typings';
import type { MapperPluggable } from '../../type';
import type { MapperItemInputs } from './type';

import { MapperComposer } from '../..';
import { isPluginConfigEqual } from '../../../plugin-builder';
import { useMapperInputs } from './utils';

export const MapperItem = /*#__PURE__*/ once(function MapperItem({
  mapper,
  mappers,
  source,
}: MapperItemInputs): JSXDescriptor<IBlockState<HastRoot>[]> {
  const config = useMap(
    mappers,
    (items, previous): object | undefined => {
      const item = first(items);

      if ((isArray(item) ? item[0] : item) !== mapper) {
        return previous?.[1];
      }

      return isArray(item) ? item[1] : undefined;
    },
    isPluginConfigEqual,
  );

  // Freeze the old suffix while its mapper is being replaced.
  const rest = useMap(mappers, (items, previous): MapperPluggable[] => {
    const item = first(items);

    return (isArray(item) ? item[0] : item) === mapper ? tail(items) : (previous?.[1] ?? []);
  });

  const inputs = useMapperInputs({ config, source });

  return <MapperComposer mappers={rest} source={mapper(inputs)} />;
});
