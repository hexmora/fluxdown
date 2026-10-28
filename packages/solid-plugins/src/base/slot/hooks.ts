import { isPluggablesEqual, PluginBuilder } from '@fluxdown/core';
import { set } from 'lodash-es';
import { createMemo, onCleanup } from 'solid-js';
import { render, S } from 'stative';

import type { AnySlotPluggable, AnySlotPlugin, Slots } from './type';

import { createStateOf, createStateValue } from '../primitives';

export const createSlots = (source: () => readonly AnySlotPluggable[]) => {
  const plugins = createStateOf(() => [...source()], isPluggablesEqual);

  const builder = render(S([PluginBuilder<AnySlotPlugin>, { plugins }]));

  const instances = createStateValue(builder.value);

  onCleanup(() => builder.destroy());

  return createMemo(() => {
    const slots: Partial<Slots> = {};

    for (const instance of instances()) {
      if (!instance.Component) {
        continue;
      }

      const current = slots[instance.type] ?? [];

      set(slots, [instance.type], [...current, instance]);
    }

    return slots;
  });
};
