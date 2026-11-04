import type { InjectionKey, Ref, VNodeChild } from 'vue';

import { computed, defineComponent, inject, provide } from 'vue';

const TextLayoutWidthContext: InjectionKey<Ref<number | undefined>> =
  /*#__PURE__*/ Symbol('FluxdownTextLayoutWidth');

export const TextLayoutWidthProvider = /*#__PURE__*/ defineComponent(
  (props: { value?: number; children?: VNodeChild }, { slots }) => {
    provide(
      TextLayoutWidthContext,
      computed(() => props.value),
    );

    return () => slots.default?.() ?? props.children;
  },
  { name: 'FluxdownTextLayoutWidthProvider', props: ['value', 'children'], inheritAttrs: false },
);

/** Width of the nearest native root text; inline text does not emit layout events. */
export const useTextLayoutWidth = (): number | undefined =>
  inject(TextLayoutWidthContext, null)?.value;

export const useTextLayoutWidthSource = () => inject(TextLayoutWidthContext, null);
