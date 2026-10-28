import type { SlotProviderProps } from './type';

import { SlotsContext } from '../../context';
import { createSlots } from '../../hooks';

export * from './type';

export const SlotProvider = (props: SlotProviderProps) => {
  const slots = createSlots(() => props.plugins);

  return <SlotsContext.Provider value={slots}>{props.children}</SlotsContext.Provider>;
};
