import type { IPluginItem } from '@fluxdown/solid-plugins/typings';
import type { Accessor } from 'solid-js';

import { filterDisabledBy, toPluginList } from '@fluxdown/solid-plugins/base';
import { castArray } from 'lodash-es';
import { createMemo } from 'solid-js';

import { EL } from '../consts';

type PluginChannel = Exclude<keyof IPluginItem, 'config'>;

export const createPlugins = <K extends PluginChannel>(items: Accessor<IPluginItem[]>, type: K) => {
  return createMemo(() => toPluginList(items(), type));
};

export const createMergedPlugins = (
  presets: IPluginItem[],
  plugins: Accessor<IPluginItem | IPluginItem[] | undefined>,
) => {
  return createMemo<IPluginItem>(() => {
    const items = castArray(plugins() ?? EL);

    const merge = <K extends PluginChannel>(type: K): NonNullable<IPluginItem[K]> => {
      const overrides = toPluginList(items, type);

      return [
        ...filterDisabledBy(toPluginList(presets, type), overrides),
        ...overrides,
      ] as NonNullable<IPluginItem[K]>;
    };

    return {
      remarks: merge('remarks'),
      rehypes: merge('rehypes'),
      repairs: merge('repairs'),
      mappers: merge('mappers'),
      renders: merge('renders'),
      slots: merge('slots'),
    };
  });
};
