import type { ISlotPlugin, SlotPositionType, SlotProps, SlotType } from './type';

export abstract class BaseSlotPlugin<
  T extends SlotType,
  Props extends object = SlotProps[T],
> implements ISlotPlugin<T, Props> {
  readonly config = {};

  abstract readonly Component: SlotPositionType<Props>;

  abstract readonly type: T;

  destroy() {}
}
