import type { GetPropsFunction } from '@fluxdown/vue-plugins/typings';
import type { InjectionKey } from 'vue';

import { inject, provide } from 'vue';

export interface RenderConfig {
  getProps?: GetPropsFunction | null;
}

const RenderContext: InjectionKey<RenderConfig> = /*#__PURE__*/ Symbol('FluxdownRender');

export const provideRender = (config: RenderConfig) => {
  provide(RenderContext, config);
};

export const useRender = (): RenderConfig => {
  const config = inject(RenderContext, null);

  if (config === null) {
    throw new Error('[Fluxdown] A render context is required.');
  }

  return config;
};
