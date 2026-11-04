import { isPluggablesEqual, PluginBuilder } from '@fluxdown/core';
import { set } from 'lodash-es';
import { render, S } from 'stative';
import { computed, onScopeDispose } from 'vue';

import type { AnySlotPluggable, AnySlotPlugin, Slots } from './type';

import { useStateOf, useStateValue } from '../composables';

export const useSlots = (source: () => readonly AnySlotPluggable[]) => {
  const plugins = useStateOf(() => [...source()], isPluggablesEqual);

  const builder = render(S([PluginBuilder<AnySlotPlugin>, { plugins }]));

  const instances = useStateValue(builder.value);

  onScopeDispose(() => builder.destroy());

  return computed(() => {
    const slots: Partial<Slots> = {};

    for (const instance of instances.value) {
      if (!instance.Component) {
        continue;
      }

      const current = slots[instance.type] ?? [];

      set(slots, [instance.type], [...current, instance]);
    }

    return slots;
  });
};
