import type { IPluginItem } from '@fluxdown/react-base-plugins/typings';

import { filterDisabledBy, toPluginList } from '@fluxdown/react-base-plugins/base';
import { castArray } from 'lodash-es';
import { useMemo } from 'react';

import { EL } from '../consts';

type PluginChannel = Exclude<keyof IPluginItem, 'config'>;

type PluginList<T extends PluginChannel> = NonNullable<IPluginItem[T]>;

export function useMergePlugins(
  presets: IPluginItem[],
  plugins: IPluginItem | IPluginItem[] = EL,
): IPluginItem {
  return useMemo(() => {
    const items = castArray(plugins);

    const getByType = <T extends PluginChannel>(type: T): PluginList<T> => {
      const extras = toPluginList(items, type);

      const defaults = filterDisabledBy(toPluginList(presets, type), extras);

      return [...defaults, ...extras] as PluginList<T>;
    };

    return {
      remarks: getByType('remarks'),
      rehypes: getByType('rehypes'),
      repairs: getByType('repairs'),
      mappers: getByType('mappers'),
      renders: getByType('renders'),
      slots: getByType('slots'),
    };
  }, [presets, plugins]);
}
