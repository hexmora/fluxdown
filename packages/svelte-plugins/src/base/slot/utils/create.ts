import type { SlotComponent } from '../../render/node';
import type { SlotInputProps, SlotType } from '../type';

export const createTypeOfSlot = <T extends SlotType>(type: T): SlotComponent<SlotInputProps<T>> => {
  return { slot: type };
};
