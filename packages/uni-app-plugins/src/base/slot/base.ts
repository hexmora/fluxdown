import type { Component } from 'vue';

import type { ISlotPlugin, SlotType } from './type';

export abstract class BaseSlotPlugin<T extends SlotType> implements ISlotPlugin<T> {
  readonly config = {};

  abstract readonly Component: Component | null;

  abstract readonly type: T;

  destroy() {}
}
