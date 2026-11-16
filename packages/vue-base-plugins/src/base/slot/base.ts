import type { IPluggableConfig, SlotPluginContext } from '@fluxdown/types';

import type { ISlotPlugin, SlotPositionType, SlotProps, SlotType } from './type';

export abstract class BaseSlotPlugin<
  T extends SlotType,
  Props extends object = SlotProps[T],
> implements ISlotPlugin<T, Props> {
  readonly config = {};

  abstract readonly Component: SlotPositionType<Props>;

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
