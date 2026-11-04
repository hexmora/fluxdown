import type { IPluginItem } from '@fluxdown/vue-base-plugins/typings';

import { filterDisabledBy, toPluginList } from '@fluxdown/vue-base-plugins/base';
import { castArray } from 'lodash-es';
import { computed } from 'vue';

import { EL } from '../../consts';

type PluginChannel = Exclude<keyof IPluginItem, 'config'>;

export const useMergePlugins = (
  presets: IPluginItem[],
  plugins: () => IPluginItem | IPluginItem[] | undefined,
) =>
  computed<IPluginItem>(() => {
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
