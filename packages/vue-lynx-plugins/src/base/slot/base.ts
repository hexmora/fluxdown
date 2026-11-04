import type { SlotType } from '@fluxdown/vue-base-plugins/base';

import { BaseSlotPlugin as SharedBaseSlotPlugin } from '@fluxdown/vue-base-plugins/base';

import type { SlotProps } from './type';

export abstract class BaseSlotPlugin<T extends SlotType> extends SharedBaseSlotPlugin<
  T,
  SlotProps[T]
> {}
