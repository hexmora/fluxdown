import type { TextStyle } from 'react-native';

import { createContext, useContext, useMemo } from 'react';

import { useTheme } from '../../theme';

const TextContext = /*#__PURE__*/ createContext<TextStyle | null>(null);

export const TextProvider = TextContext.Provider;

export const useTextStyle = (): TextStyle => {
  const inherited = useContext(TextContext);

  const { tokens } = useTheme();

  return useMemo(
    () =>
      inherited ?? {
        color: tokens.colors.fg,
        fontFamily: tokens.typography.fontSans,
        fontSize: tokens.typography.fontSize.md,
        lineHeight: tokens.typography.fontSize.md * tokens.typography.lineHeight.md,
      },
    [inherited, tokens],
  );
};
