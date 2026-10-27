import { computed, defineComponent, h, inject, onErrorCaptured, shallowRef, watch } from 'vue';

import type { SlotRendererProps } from './type';

import { SlotsContext } from '../../context';
import { createSlotComposer } from '../../utils/compose';

export * from './type';

export const SlotRenderer = /*#__PURE__*/ defineComponent(
  (props: SlotRendererProps) => {
    const slots = inject(SlotsContext, null);

    if (!slots) {
      throw new Error(`The ${props.type} slot requires a Fluxdown SlotProvider.`);
    }

    const compose = createSlotComposer();

    const Component = computed(() => compose(slots.value[props.type] ?? []));

    const Wrapper = computed(() => compose(slots.value.Wrapper ?? []));

    const Fallback = computed(() => compose(slots.value.Fallback ?? []));

    const failure = shallowRef<{ error: unknown } | null>(null);

    const reset = () => {
      failure.value = null;
    };

    watch([Component, Wrapper, Fallback, () => props.props], reset, { flush: 'sync' });

    onErrorCaptured((error) => {
      if (props.type === 'Fallback' || props.type === 'Wrapper' || failure.value) {
        return;
      }

      failure.value = { error };

      return false;
    });

    return () => {
      if (failure.value) {
        return Fallback.value
          ? h(Fallback.value, {
              type: props.type,
              props: props.props,
              error: failure.value.error,
              onReset: reset,
            })
          : null;
      }

      if (!Component.value) {
        return null;
      }

      const child = h(Component.value, props.props);

      if (props.type === 'Fallback' || props.type === 'Wrapper' || !Wrapper.value) {
        return child;
      }

      return h(Wrapper.value, { props: props.props, type: props.type, children: child });
    };
  },
  { name: 'FluxdownSlotRenderer', props: ['props', 'type'], inheritAttrs: false },
);
