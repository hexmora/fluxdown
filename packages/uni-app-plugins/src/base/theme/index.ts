import type { ComputedRef, InjectionKey } from 'vue';

import { merge } from 'lodash-es';
import { computed, inject, provide } from 'vue';

import type { Theme, ThemeConfig } from '../../typings/theme';

import { DARK_THEME, LIGHT_THEME } from './presets';

export * from './presets';
export * from './spacing';

const ThemeContext: InjectionKey<ComputedRef<ThemeConfig>> = /*#__PURE__*/ Symbol('FluxdownTheme');

export const toThemeConfig = (theme: Theme = 'light'): ThemeConfig => {
  const [preset, overrides] = Array.isArray(theme)
    ? theme
    : typeof theme === 'string'
      ? [theme, undefined]
      : ['light', theme];

  const base = preset === 'dark' ? DARK_THEME : LIGHT_THEME;

  return overrides ? merge({}, base, overrides) : base;
};

export const provideTheme = (source: () => Theme) => {
  const theme = computed(() => toThemeConfig(source()));

  provide(ThemeContext, theme);

  return theme;
};

export const useTheme = () => inject(ThemeContext, null) ?? computed(() => LIGHT_THEME);
