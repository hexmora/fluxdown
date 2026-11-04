import type { Root } from 'hast';
import type { InjectionKey, Ref, VNodeChild } from 'vue';

import { computed, defineComponent, inject, provide } from 'vue';

export interface BlockLayout {
  first: boolean;

  last: boolean;

  previous?: Root | null;
}

const BlockLayoutContext: InjectionKey<Ref<BlockLayout>> =
  /*#__PURE__*/ Symbol('FluxdownBlockLayout');

export const BlockLayoutProvider = /*#__PURE__*/ defineComponent(
  (props: { value: BlockLayout; children?: VNodeChild }, { slots }) => {
    provide(
      BlockLayoutContext,
      computed(() => props.value),
    );

    return () => slots.default?.() ?? props.children;
  },
  { name: 'FluxdownBlockLayoutProvider', props: ['value', 'children'], inheritAttrs: false },
);

export const useBlockLayout = (): Ref<BlockLayout> =>
  inject(BlockLayoutContext, null) ?? computed(() => ({ first: true, last: true }));
