import type { Type } from '@angular/core';
import type {
  ISlotPlugin,
  SlotComponent,
  SlotProps,
  SlotType,
} from '@fluxdown/angular-plugins/typings';

export abstract class BaseSlotPlugin<T extends SlotType> implements ISlotPlugin<T> {
  readonly config = {};

  abstract readonly Component: Type<SlotComponent<SlotProps[T]>> | null;

  abstract readonly type: T;

  readonly tagName?: string | ((props: SlotProps[T]) => string);

  destroy() {}
}
