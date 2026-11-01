import type { UniRenderNode, UniSlotNode } from '../../../typings/render';
import type { SlotType } from '../type';

export const createTypeOfSlot = (type: SlotType) => {
  return (props: Record<string, unknown> = {}, children?: UniRenderNode): UniSlotNode => {
    return {
      type,
      props,
      children:
        children === undefined ? undefined : Array.isArray(children) ? children : [children],
    };
  };
};
