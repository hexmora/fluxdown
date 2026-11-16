import type { IPluggableConfig, SlotPluginContext } from '@fluxdown/types';
import type { Component } from 'vue';

import type { ISlotPlugin, SlotType } from './type';

export abstract class BaseSlotPlugin<T extends SlotType> implements ISlotPlugin<T> {
  readonly config = {};

  abstract readonly Component: Component | null;

  abstract readonly type: T;

  static enabled(_context: SlotPluginContext): boolean {
    return true;
  }

  static prepareConfig(
    _context: SlotPluginContext,
    _outerConfig: IPluggableConfig<unknown>,
  ): IPluggableConfig<unknown> | null {
    return null;
  }

  destroy() {}
}
