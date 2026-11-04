import type { VNodeChild } from 'vue';

import type { AnySlotPluggable } from '../../type';

export interface SlotProviderProps {
  plugins: readonly AnySlotPluggable[];

  children?: VNodeChild;
}
