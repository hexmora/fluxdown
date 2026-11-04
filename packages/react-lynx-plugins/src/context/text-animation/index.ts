import type { CSSProperties } from '@lynx-js/types';

import { createContext, useContext } from '@lynx-js/react';

import type { TextColorAnimation } from './type';

export * from './type';

const TextAnimationContext = /*#__PURE__*/ createContext<CSSProperties | TextColorAnimation | null>(
  null,
);

export const TextAnimationProvider = TextAnimationContext.Provider;

export const useTextAnimation = (): CSSProperties | TextColorAnimation | null =>
  useContext(TextAnimationContext);
