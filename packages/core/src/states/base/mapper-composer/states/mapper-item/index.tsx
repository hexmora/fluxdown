/** @jsxImportSource stative */

import type { IBlockState } from '@fluxdown/types';
import type { JSXDescriptor } from 'stative';

import { first, tail } from 'lodash-es';
import { once, useMap } from 'stative';

import type { HastRoot } from '../../../../../typings';
import type { MapperPluggable } from '../../type';
import type { MapperItemInputs } from './type';

import { MapperComposer } from '../..';
import { isPluggableEqual } from '../../../plugin-builder';

export const MapperItem = /*#__PURE__*/ once(function MapperItem({
  mapper,
  mappers,
  source,
}: MapperItemInputs): JSXDescriptor<IBlockState<HastRoot>[]> {
  const [Mapper, config] = mapper;

  // Freeze the old suffix while its mapper is being replaced.
  const rest = useMap(mappers, (items, previous): MapperPluggable[] =>
    isPluggableEqual(first(items), mapper) ? tail(items) : (previous?.[1] ?? []),
  );

  return <MapperComposer mappers={rest} source={Mapper({ ...config, source })} />;
});
