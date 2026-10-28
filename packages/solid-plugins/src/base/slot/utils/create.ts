import type { Component } from 'solid-js';

import { createComponent } from 'solid-js';

import type { SlotInputProps, SlotType } from '../type';

import { SlotRenderer } from '../components/slot-renderer';

export const createTypeOfSlot = <T extends SlotType>(type: T): Component<SlotInputProps<T>> => {
  return (props) => {
    return createComponent(SlotRenderer, { props, type });
  };
};
