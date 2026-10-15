import type { MapperPluggable } from '@fluxdown/core';
import type { IPluggable, IPluginWithConfig } from '@fluxdown/types';
import type { FlattenedState } from 'stative';

import { isPluggableEnabled, toPluggable } from '@fluxdown/core';
import { useDeferredUnmount, useStateOf, useStatic } from '@fluxdown/react-base-presets/base';
import { forEach, isArray } from 'lodash-es';
import { useMemo } from 'react';
import { shallowEqual } from 'shallow-equal';
import { flattenClosure } from 'stative';

import type { IPluginItem, PluginConfigs } from '../types';

import { EL, EO } from '../consts';

type PluginChannel = Exclude<keyof IPluginItem, 'config'>;

type PluginList<T extends PluginChannel> = NonNullable<IPluginItem[T]>;

type PackPluggable = IPluggable<IPluginWithConfig, unknown> | MapperPluggable;

export const usePluginConfig = <T extends object>(config: T): FlattenedState<T> => {
  const source = useStateOf(config, shallowEqual);

  const fields = useStatic(() => flattenClosure(source));

  useDeferredUnmount(() => forEach(fields, (field) => field.destroy()));

  return fields;
};

export function usePlugins<T extends PluginChannel>(
  items: readonly IPluginItem[],
  type: T,
  defaults?: PluginList<T>,
): PluginList<T>;

export function usePlugins(
  items: readonly IPluginItem[],
  type: PluginChannel,
  defaults: readonly PackPluggable[] = EL,
): PackPluggable[] {
  return useMemo(() => {
    const plugins = items.flatMap((item) =>
      toPluggable<PackPluggable, PluginConfigs>([item[type] ?? EL, item.config ?? EO]),
    );

    const combined = [...defaults, ...plugins];

    const disabled = new Map(
      combined.flatMap((plugin, index) =>
        isPluggableEnabled(plugin) ? [] : [[isArray(plugin) ? plugin[0] : plugin, index] as const],
      ),
    );

    return combined.filter(
      (plugin, index) =>
        !isPluggableEnabled(plugin) ||
        (disabled.get(isArray(plugin) ? plugin[0] : plugin) ?? -1) < index,
    );
  }, [defaults, items, type]);
}
