import type { JSX } from 'solid-js';

import type { AnySlotPluggable } from '../../type';

export interface SlotProviderProps {
  plugins: readonly AnySlotPluggable[];

  children?: JSX.Element;
}
