import type { Accessor } from 'solid-js';

import { createContext } from 'solid-js';

import type { Slots } from './type';

export const SlotsContext = /*#__PURE__*/ createContext<Accessor<Partial<Slots>> | null>(null);
