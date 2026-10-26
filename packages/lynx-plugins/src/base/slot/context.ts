import { createContext } from '@lynx-js/react';

import type { Slots } from './type';

export const SlotsContext = /*#__PURE__*/ createContext<Partial<Slots> | null>(null);
