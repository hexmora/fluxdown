import type { GetPropsFunction } from '@fluxdown/svelte-plugins/typings';

import { getContext, setContext } from 'svelte';

interface RenderConfig {
  getProps?: GetPropsFunction | null;
}

const RENDER_CONTEXT = Symbol('fluxdown-svelte-render');

export const provideRender = (config: RenderConfig) => {
  setContext(RENDER_CONTEXT, config);
};

export const useRender = (): RenderConfig => {
  const config = getContext<RenderConfig | undefined>(RENDER_CONTEXT);

  if (!config) {
    throw new Error('Fluxdown render context is unavailable outside a Fluxdown component.');
  }

  return config;
};
