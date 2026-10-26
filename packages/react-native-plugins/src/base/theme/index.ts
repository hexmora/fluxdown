import { merge } from 'lodash-es';
import { createContext, useContext, useMemo } from 'react';

import type { Theme, ThemeConfig } from '../../typings/theme';

import { DARK_THEME, LIGHT_THEME } from './presets';

export * from './presets';

const ThemeContext = /*#__PURE__*/ createContext<ThemeConfig>(LIGHT_THEME);

export const ThemeProvider = ThemeContext.Provider;

export const useTheme = () => useContext(ThemeContext);

export const useThemeConfig = (theme: Theme = 'light'): ThemeConfig =>
  useMemo(() => {
    const [preset, overrides] = Array.isArray(theme)
      ? theme
      : typeof theme === 'string'
        ? [theme, undefined]
        : ['light', theme];

    const base = preset === 'dark' ? DARK_THEME : LIGHT_THEME;

    return overrides ? merge({}, base, overrides) : base;
  }, [theme]);
