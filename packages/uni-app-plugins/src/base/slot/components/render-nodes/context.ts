import type { ComputedRef, InjectionKey } from 'vue';

export const RenderTailContext: InjectionKey<ComputedRef<boolean>> =
  /*#__PURE__*/ Symbol('FluxdownRenderTail');
