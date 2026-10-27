import { h } from 'vue';

import type { AnySlotPlugin, RuntimeSlotComponent, RuntimeSlotInputComponent } from '../type';

export const createSlotComposer = () => {
  const rawSlots = new WeakMap<RuntimeSlotComponent, RuntimeSlotInputComponent>();

  const composedSlots = new WeakMap<
    RuntimeSlotComponent,
    WeakMap<RuntimeSlotInputComponent, RuntimeSlotInputComponent>
  >();

  return (plugins: readonly AnySlotPlugin[]): RuntimeSlotInputComponent | null => {
    let Raw: RuntimeSlotInputComponent | null = null;

    for (const plugin of plugins) {
      const Component = plugin.Component as RuntimeSlotComponent | null;

      if (!Component) {
        continue;
      }

      const Previous: RuntimeSlotInputComponent | null = Raw;

      const compositions = composedSlots.get(Component);

      const cached: RuntimeSlotInputComponent | undefined = Previous
        ? compositions?.get(Previous)
        : rawSlots.get(Component);

      if (cached) {
        Raw = cached;

        continue;
      }

      const ComposedSlot: RuntimeSlotInputComponent = (props, { slots }) => {
        const children = slots.default?.() ?? ('children' in props ? props.children : undefined);

        return h(
          Component,
          { ...props, ...(children === undefined ? {} : { children }), Raw: Previous },
          children === undefined ? undefined : { default: () => children },
        );
      };

      ComposedSlot.inheritAttrs = false;

      if (Previous) {
        const current =
          compositions ?? new WeakMap<RuntimeSlotInputComponent, RuntimeSlotInputComponent>();

        current.set(Previous, ComposedSlot);

        composedSlots.set(Component, current);
      } else {
        rawSlots.set(Component, ComposedSlot);
      }

      Raw = ComposedSlot;
    }

    return Raw;
  };
};
