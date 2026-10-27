import { createContext, useContext } from '@lynx-js/react';

const TextLayoutWidthContext = /*#__PURE__*/ createContext<number | undefined>(undefined);

export const TextLayoutWidthProvider = TextLayoutWidthContext.Provider;

/** Width of the nearest native root text; inline text does not emit layout events. */
export const useTextLayoutWidth = (): number | undefined => useContext(TextLayoutWidthContext);
