import { defineComponent, provide } from 'vue';

import type { SlotProviderProps } from './type';

import { SlotsContext } from '../../context';
import { useSlots } from '../../hooks';

export * from './type';

export const SlotProvider = /*#__PURE__*/ defineComponent(
  (props: SlotProviderProps, { slots }) => {
    provide(
      SlotsContext,
      useSlots(() => props.plugins),
    );

    return () => {
      return slots.default?.() ?? props.children;
    };
  },
  { name: 'FluxdownSlotProvider', props: ['plugins', 'children'], inheritAttrs: false },
);
