import type { IPluginItem } from '@fluxdown/vue-base-plugins/typings';

import { toPluginList } from '@fluxdown/vue-base-plugins/base';
import { computed } from 'vue';

type PluginChannel = Exclude<keyof IPluginItem, 'config'>;

export const usePlugins = <K extends PluginChannel>(items: () => IPluginItem[], type: K) =>
  computed(() => toPluginList(items(), type));
