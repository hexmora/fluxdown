import { createContext, useContext, useMemo } from 'react';

import type { TextColorProviderProps, TextColors } from './type';

const TextColorContext = /*#__PURE__*/ createContext<TextColors>({
  color: '#202123',
  muted: '#64676b',
  accent: '#0969da',
});

export const TextColorProvider = ({ value, muted, accent, children }: TextColorProviderProps) => {
  const inherited = useContext(TextColorContext);

  const mutedColor = muted ?? inherited.muted;

  const accentColor = accent ?? inherited.accent;

  const colors = useMemo(
    () => ({ color: value, muted: mutedColor, accent: accentColor }),
    [value, mutedColor, accentColor],
  );

  return <TextColorContext.Provider value={colors}>{children}</TextColorContext.Provider>;
};

export const useTextColor = (role: keyof TextColors = 'color') => {
  return useContext(TextColorContext)[role];
};
