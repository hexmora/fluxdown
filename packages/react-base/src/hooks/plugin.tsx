import type { MapperPluggable } from '@fluxdown/core';
import type { IPluggable, IPluginWithConfig } from '@fluxdown/types';

import { toPluggable } from '@fluxdown/core';
import { filterDisabledBy } from '@fluxdown/react-base-presets/base';
import { castArray } from 'lodash-es';
import { useMemo } from 'react';

import type { IPluginItem, PluginConfigs } from '../types';

import { EL, EO } from '../consts';

type PluginChannel = Exclude<keyof IPluginItem, 'config'>;

type PluginList<T extends PluginChannel> = NonNullable<IPluginItem[T]>;

type PackPluggable = IPluggable<IPluginWithConfig, unknown> | MapperPluggable;

const toPluginList = (items: IPluginItem[], type: PluginChannel): PackPluggable[] =>
  items.reduce<PackPluggable[]>((plugins, item) => {
    const overrides = toPluggable<PackPluggable, PluginConfigs>([
      item[type] ?? EL,
      item.config ?? EO,
    ]);

    return [...filterDisabledBy(plugins, overrides), ...overrides];
  }, []);

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

export function usePlugins<T extends PluginChannel>(
  items: IPluginItem[],
  type: T,
  defaults?: PluginList<T>,
): PluginList<T>;

export function usePlugins(
  items: IPluginItem[],
  type: PluginChannel,
  defaults: PackPluggable[] = EL,
): PackPluggable[] {
  return useMemo(() => {
    const plugins = toPluginList(items, type);

    return [...filterDisabledBy(defaults, plugins), ...plugins];
  }, [defaults, items, type]);
}
