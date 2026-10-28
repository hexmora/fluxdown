import type { GetPropsFunction } from '@fluxdown/solid-plugins/typings';

import { createContext, useContext } from 'solid-js';

export interface RenderConfig {
  getProps?: GetPropsFunction | null;
}

const RenderContext = /*#__PURE__*/ createContext<RenderConfig | null>(null);

export const RenderProvider = RenderContext.Provider;

export const useRender = (): RenderConfig => {
  const config = useContext(RenderContext);

  if (config === null) {
    throw new Error('[Fluxdown] A render context is required.');
  }

  return config;
};
