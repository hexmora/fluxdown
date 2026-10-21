import type { SlotType } from '@fluxdown/react-base-presets/base';
import type { ComponentType } from 'react';

import { createTypeOfSlot as createBaseTypeOfSlot } from '@fluxdown/react-base-presets/base';

import type { SlotInputProps } from '../type';

export const createTypeOfSlot = <T extends SlotType>(type: T): ComponentType<SlotInputProps<T>> =>
  createBaseTypeOfSlot<T, SlotInputProps<T>>(type);
