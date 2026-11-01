import type { AngularSlotNode, SlotInputProps, SlotType } from '@fluxdown/angular-plugins/typings';

export const createTypeOfSlot = <T extends SlotType>(type: T) => {
  return (props: SlotInputProps<T> & { key?: string | number }): AngularSlotNode => {
    const { key, ...attributes } = props;

    return { kind: 'slot', type, props: attributes as SlotInputProps, key };
  };
};
