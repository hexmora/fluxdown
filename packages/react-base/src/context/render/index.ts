import { createContext, useContext } from 'react';

import type { RenderConfig } from './type';

import { createShallowedProvider } from '../utils';

export * from './type';

const RenderContext = /*#__PURE__*/ createContext<RenderConfig | null>(null);

export const RenderProvider = /*#__PURE__*/ createShallowedProvider(RenderContext);

export const useRender = (): RenderConfig => {
  const context = useContext(RenderContext);

  if (context === null) {
    throw new Error('[Fluxdown] RenderContext is required');
  }

  return context;
};
