import type { Type } from '@angular/core';
import type {
  ISlotPlugin,
  SlotComponent,
  SlotProps,
  SlotType,
} from '@fluxdown/angular-plugins/typings';
import type { IPluggableConfig, SlotPluginContext } from '@fluxdown/types';

export abstract class BaseSlotPlugin<T extends SlotType> implements ISlotPlugin<T> {
  readonly config = {};

  abstract readonly Component: Type<SlotComponent<SlotProps[T]>> | null;

  abstract readonly type: T;

  readonly tagName?: string | ((props: SlotProps[T]) => string);

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
