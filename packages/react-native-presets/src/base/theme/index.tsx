import { isEqual } from 'lodash-es';
import { createContext, useContext, useRef } from 'react';

import type { MarkdownStyles, NativeTheme, NativeThemeProviderProps, Theme } from './type';

export * from './type';

export const LIGHT_THEME: NativeTheme = {
  colors: {
    text: '#202123',
    muted: '#64676b',
    background: '#ffffff',
    border: '#e5e7eb',
    borderEmphasis: '#b5bac1',
    surfaceMuted: '#f1f2f4',
    link: '#0969da',
    codeBackground: '#f7f8fa',
    quoteBackground: '#f7f8fa',
  },
  syntax: {
    comment: '#6e7781',
    keyword: '#cf222e',
    string: '#0a3069',
    number: '#0550ae',
    function: '#8250df',
    variable: '#953800',
    punctuation: '#57606a',
    inserted: '#116329',
    deleted: '#a40e26',
  },
};

export const DARK_THEME: NativeTheme = {
  colors: {
    text: '#ececf1',
    muted: '#a6a8b0',
    background: '#212121',
    border: '#3c3e42',
    borderEmphasis: '#666970',
    surfaceMuted: '#353639',
    link: '#82b7ff',
    codeBackground: '#292a2d',
    quoteBackground: '#292a2d',
  },
  syntax: {
    comment: '#9da7b3',
    keyword: '#ff7b72',
    string: '#a5d6ff',
    number: '#79c0ff',
    function: '#d2a8ff',
    variable: '#ffa657',
    punctuation: '#c9d1d9',
    inserted: '#7ee787',
    deleted: '#ffa198',
  },
};

const NativeThemeContext = /*#__PURE__*/ createContext({
  ...LIGHT_THEME,
  styles: LIGHT_THEME.styles ?? {},
  selectable: false,
});

interface ThemeCache {
  theme: Theme;

  styles: MarkdownStyles | undefined;

  selectable: boolean;

  value: NativeTheme & {
    styles: MarkdownStyles;

    selectable: boolean;
  };
}

export const NativeThemeProvider = ({
  children,
  theme = 'light',
  styles,
  selectable = false,
}: NativeThemeProviderProps) => {
  const cache = useRef<ThemeCache | null>(null);

  if (
    !cache.current ||
    !isEqual(cache.current.theme, theme) ||
    !isEqual(cache.current.styles, styles) ||
    cache.current.selectable !== selectable
  ) {
    const preset = Array.isArray(theme) ? theme[0] : typeof theme === 'string' ? theme : 'light';

    const overrides = Array.isArray(theme) ? theme[1] : typeof theme === 'object' ? theme : {};

    const base = preset === 'dark' ? DARK_THEME : LIGHT_THEME;

    cache.current = {
      theme,
      styles,
      selectable,
      value: {
        colors: { ...base.colors, ...overrides.colors },
        syntax: { ...base.syntax, ...overrides.syntax },
        styles: { ...base.styles, ...overrides.styles, ...styles },
        selectable,
      },
    };
  }

  return (
    <NativeThemeContext.Provider value={cache.current.value}>
      {children}
    </NativeThemeContext.Provider>
  );
};

export const useNativeTheme = () => useContext(NativeThemeContext);
