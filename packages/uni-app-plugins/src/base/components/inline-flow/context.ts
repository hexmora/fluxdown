import { inject, provide } from 'vue';

const InlineFlowContext = /*#__PURE__*/ Symbol('FluxdownInlineFlow');

export const provideInlineFlow = (enabled = true) => provide(InlineFlowContext, enabled);

export const useInlineFlow = () => inject(InlineFlowContext, false);
