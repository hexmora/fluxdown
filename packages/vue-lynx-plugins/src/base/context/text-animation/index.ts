import type { CSSProperties } from '@lynx-js/types';
import type { InjectionKey, Ref, VNodeChild } from 'vue';

import { computed, defineComponent, inject, provide } from 'vue';

import type { TextColorAnimation } from './type';

export * from './type';

type TextAnimation = CSSProperties | TextColorAnimation | null;

const TextAnimationContext: InjectionKey<Ref<TextAnimation>> =
  /*#__PURE__*/ Symbol('FluxdownTextAnimation');

export const TextAnimationProvider = /*#__PURE__*/ defineComponent(
  (props: { value: TextAnimation; children?: VNodeChild }, { slots }) => {
    provide(
      TextAnimationContext,
      computed(() => props.value),
    );

    return () => slots.default?.() ?? props.children;
  },
  { name: 'FluxdownTextAnimationProvider', props: ['value', 'children'], inheritAttrs: false },
);

export const useTextAnimation = (): TextAnimation =>
  inject(TextAnimationContext, null)?.value ?? null;

export const useTextAnimationSource = () => inject(TextAnimationContext, null);
