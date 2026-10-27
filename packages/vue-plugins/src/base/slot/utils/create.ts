import type { FunctionalComponent } from 'vue';

import { h } from 'vue';

import type { SlotInputProps, SlotType } from '../type';

import { SlotRenderer } from '../components/slot-renderer';

export const createTypeOfSlot = <T extends SlotType>(
  type: T,
): FunctionalComponent<SlotInputProps<T>> => {
  const TypeOfSlot: FunctionalComponent<SlotInputProps<T>> = (props, { slots }) => {
    const children = slots.default?.() ?? ('children' in props ? props.children : undefined);

    return h(SlotRenderer, {
      props: { ...props, ...(children === undefined ? {} : { children }) },
      type,
    });
  };

  TypeOfSlot.displayName = `FluxdownTypeOfSlot(${type})`;

  TypeOfSlot.inheritAttrs = false;

  return TypeOfSlot;
};
