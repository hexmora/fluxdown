import type { InjectionKey, Ref } from 'vue';

import type { Slots } from './type';

export const SlotsContext: InjectionKey<Ref<Partial<Slots>>> =
  /*#__PURE__*/ Symbol('FluxdownSlots');
