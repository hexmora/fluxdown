import type { IPluginItem, PluginConfigs } from '@fluxdown/angular-plugins/typings';
import type { MapperPluggable } from '@fluxdown/core';
import type { IPluggable, IPluginWithConfig } from '@fluxdown/types';

import { isPluggableEnabled, toPluggable } from '@fluxdown/core';
import { differenceBy, isArray } from 'lodash-es';

import { EL, EO } from '../consts';

type PackPluggable = IPluggable<IPluginWithConfig, unknown> | MapperPluggable;

type PluginChannel<T> = Exclude<keyof T, 'config'>;

export const filterDisabledBy = (
  plugins: PackPluggable[],
  overrides: PackPluggable[],
): PackPluggable[] =>
  differenceBy(
    plugins,
    overrides.filter((plugin) => !isPluggableEnabled(plugin)),
    (plugin) => (isArray(plugin) ? plugin[0] : plugin),
  );

export const toPluginList = <T extends IPluginItem, K extends PluginChannel<T>>(
  items: T[],
  type: K,
): NonNullable<T[K]> =>
  items.reduce<PackPluggable[]>((plugins, item) => {
    const overrides = toPluggable<PackPluggable, PluginConfigs>([
      (item[type] ?? EL) as PackPluggable[],
      item.config ?? EO,
    ]);

    return [...filterDisabledBy(plugins, overrides), ...overrides];
  }, []) as NonNullable<T[K]>;

/** Extends packs in declaration order, preserving each pack's scoped configuration. */
export const pluginExtends = (
  first: IPluginItem,
  second: IPluginItem,
  ...rest: IPluginItem[]
): IPluginItem => {
  const items = [first, second, ...rest];

  return {
    remarks: toPluginList(items, 'remarks'),
    rehypes: toPluginList(items, 'rehypes'),
    repairs: toPluginList(items, 'repairs'),
    mappers: toPluginList(items, 'mappers'),
    renders: toPluginList(items, 'renders'),
    slots: toPluginList(items, 'slots'),
  };
};
