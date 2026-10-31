import { getContext, setContext } from 'svelte';

import type { Slots } from './type';

const SLOTS_CONTEXT = Symbol('FluxdownSlots');

export const provideSlots = (slots: () => Partial<Slots>) => {
  setContext(SLOTS_CONTEXT, slots);
};

export const useSlots = (): (() => Partial<Slots>) => {
  const slots = getContext<() => Partial<Slots> | undefined>(SLOTS_CONTEXT);

  if (!slots) {
    throw new Error('Fluxdown slots require a SlotProvider.');
  }

  return slots as () => Partial<Slots>;
};
