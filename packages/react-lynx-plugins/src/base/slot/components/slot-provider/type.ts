import type { PropsWithChildren } from '@lynx-js/react';

import type { AnySlotPluggable } from '../../type';

export interface SlotProviderProps extends PropsWithChildren {
  plugins: readonly AnySlotPluggable[];
}
