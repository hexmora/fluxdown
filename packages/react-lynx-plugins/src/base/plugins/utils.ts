import type { MapperPluggable } from '@fluxdown/core';
import type { IPluggable, IPluginWithConfig } from '@fluxdown/types';

import {
  isPluggableEnabled,
  isPluggablesEqual,
  isPluginConfigEqual,
  toPluggable,
} from '@fluxdown/core';
import { castArray, differenceBy, every, isArray } from 'lodash-es';

import type { IPluginItem, PluginConfigs } from '../../typings';

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

export const isPluginItemsEqual = <T extends IPluginItem>(
  left: T | T[] = EL,
  right: T | T[] = EL,
  channels: readonly PluginChannel<T>[] = [
    'remarks',
    'rehypes',
    'repairs',
    'mappers',
    'renders',
    'slots',
  ] as PluginChannel<T>[],
): boolean => {
  if (left === right) {
    return true;
  }

  const leftItems = castArray(left);

  const rightItems = castArray(right);

  return (
    leftItems.length === rightItems.length &&
    every(leftItems, (item, index) => {
      const other = rightItems[index];

      return (
        item !== undefined &&
        other !== undefined &&
        (item === other ||
          (isPluginConfigEqual(item.config ?? EO, other.config ?? EO) &&
            channels.every((channel) =>
              isPluggablesEqual(
                item[channel] as PackPluggable[] | undefined,
                other[channel] as PackPluggable[] | undefined,
              ),
            )))
      );
    })
  );
};

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
