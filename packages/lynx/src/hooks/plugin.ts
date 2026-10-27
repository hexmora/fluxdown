import type { IPluginItem } from '@fluxdown/lynx-plugins/typings';

import { filterDisabledBy, toPluginList } from '@fluxdown/lynx-plugins/base';
import { useMemo } from '@lynx-js/react';

import { EL } from '../consts';

type PluginChannel = Exclude<keyof IPluginItem, 'config'>;

type PluginList<T extends PluginChannel> = NonNullable<IPluginItem[T]>;

export function usePlugins<T extends PluginChannel>(
  items: IPluginItem[],
  type: T,
  defaults: PluginList<T> = EL,
): PluginList<T> {
  return useMemo(() => {
    const plugins = toPluginList(items, type);

    return [...filterDisabledBy(defaults, plugins), ...plugins] as PluginList<T>;
  }, [defaults, items, type]);
}
