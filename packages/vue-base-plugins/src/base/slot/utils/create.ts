import type { Component, FunctionalComponent } from 'vue';

import { h } from 'vue';

import type { SlotInputProps, SlotType } from '../type';

import { SlotRenderer } from '../components/slot-renderer';

export const createTypeOfSlot = <T extends SlotType, Props extends object = SlotInputProps<T>>(
  type: T,
): FunctionalComponent<Props> => {
  const TypeOfSlot: FunctionalComponent<Props> = (props, { slots }) => {
    const children = slots.default?.() ?? ('children' in props ? props.children : undefined);

    return h(SlotRenderer as Component, {
      props: { ...props, ...(children === undefined ? {} : { children }) },
      type,
    });
  };

  TypeOfSlot.displayName = `FluxdownTypeOfSlot(${type})`;

  TypeOfSlot.inheritAttrs = false;

  return TypeOfSlot;
};
