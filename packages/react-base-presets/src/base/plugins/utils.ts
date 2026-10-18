import type { MapperPluggable } from '@fluxdown/core';
import type { IPluggable, IPluginWithConfig } from '@fluxdown/types';

import { isPluggableEnabled, toPluggable } from '@fluxdown/core';
import { differenceBy, isArray } from 'lodash-es';

import type { IPluginItem, PluginConfigs } from '../../typings';

type PluginChannel = Exclude<keyof IPluginItem, 'config'>;
type PluginList<T extends PluginChannel> = NonNullable<IPluginItem[T]>;
type PackPluggable = IPluggable<IPluginWithConfig, unknown> | MapperPluggable;

export const filterDisabledBy = (
  plugins: PackPluggable[],
  overrides: PackPluggable[],
): PackPluggable[] =>
  differenceBy(
    plugins,
    overrides.filter((plugin) => !isPluggableEnabled(plugin)),
    (plugin) => (isArray(plugin) ? plugin[0] : plugin),
  );

const getByType = <T extends PluginChannel>(items: IPluginItem[], type: T): PluginList<T> =>
  items.reduce<PackPluggable[]>((plugins, item) => {
    const overrides = toPluggable<PackPluggable, PluginConfigs>([
      item[type] ?? [],
      item.config ?? {},
    ]);

    return [...filterDisabledBy(plugins, overrides), ...overrides];
  }, []) as PluginList<T>;

/** Extends packs in declaration order, preserving each pack's scoped configuration. */
export const pluginExtends = (
  first: IPluginItem,
  second: IPluginItem,
  ...rest: IPluginItem[]
): IPluginItem => {
  const items = [first, second, ...rest];

  return {
    remarks: getByType(items, 'remarks'),
    rehypes: getByType(items, 'rehypes'),
    repairs: getByType(items, 'repairs'),
    mappers: getByType(items, 'mappers'),
    renders: getByType(items, 'renders'),
    slots: getByType(items, 'slots'),
  };
};
