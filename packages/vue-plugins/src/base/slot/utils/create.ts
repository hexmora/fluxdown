import type { SlotType } from '@fluxdown/vue-base-plugins/base';

import { createTypeOfSlot as createSharedSlot } from '@fluxdown/vue-base-plugins/base';

import type { SlotInputProps } from '../type';

export const createTypeOfSlot = <T extends SlotType>(type: T) =>
  createSharedSlot<T, SlotInputProps<T>>(type);
