import type { InjectionKey, Ref } from 'vue';

import { inject, provide } from 'vue';

import type { AnySlotPluggable, Slots } from './type';

import { useSlots } from './hooks';

const SlotsContext: InjectionKey<Ref<Slots>> = /*#__PURE__*/ Symbol('FluxdownSlots');

export const provideSlots = (source: () => readonly AnySlotPluggable[]) => {
  const slots = useSlots(source);

  provide(SlotsContext, slots);

  return slots;
};

export const useSlotPlugins = () => {
  const slots = inject(SlotsContext, null);

  if (!slots) {
    throw new Error('Fluxdown slots require a parent Fluxdown component.');
  }

  return slots;
};
