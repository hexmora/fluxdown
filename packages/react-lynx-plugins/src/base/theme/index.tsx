import type { PropsWithChildren } from '@lynx-js/react';
import type { CSSProperties } from '@lynx-js/types';

import { createContext, useContext, useMemo } from '@lynx-js/react';
import { isEqual } from 'lodash-es';

import type { Theme, ThemeConfig } from './type';

import { useTextAnimation } from '../../context';
import { useMemoValue } from '../hooks';
import { LIGHT_THEME } from './presets/light';
import { resolveTheme } from './utils';

export * from './type';
export * from './presets';
export * from './utils';

const ThemeContext = /*#__PURE__*/ createContext<ThemeConfig>(LIGHT_THEME);

const TextStyleContext = /*#__PURE__*/ createContext<CSSProperties | null>(null);

export const useThemeConfig = (theme: Theme = 'light'): ThemeConfig => {
  const stableTheme = useMemoValue({ theme }, isEqual).theme;

  return useMemo(() => resolveTheme(stableTheme), [stableTheme]);
};

export const useTheme = (): ThemeConfig => useContext(ThemeContext);

export const getTextStyle = ({ tokens }: ThemeConfig): CSSProperties => ({
  color: tokens.colors.fg,
  fontFamily: tokens.typography.fontSans,
  fontSize: tokens.typography.fontSize.md,
  fontWeight: String(tokens.typography.fontWeight.normal) as CSSProperties['fontWeight'],
  fontStyle: 'normal',
  lineHeight: tokens.typography.lineHeight.md,
});

export const useTextStyle = (override?: CSSProperties): CSSProperties => {
  const inherited = useContext(TextStyleContext);

  const animation = useTextAnimation();

  const theme = useTheme();

  const resolved = { ...(inherited ?? getTextStyle(theme)), ...override };

  return animation && !('arrival' in animation)
    ? ({ ...resolved, ...animation, '--fluxdown-text-color': resolved.color } as CSSProperties)
    : resolved;
};

export const TextStyleProvider = TextStyleContext.Provider;

export const ThemeProvider = ({ children, value }: PropsWithChildren<{ value: ThemeConfig }>) => {
  const textStyle = useMemo(() => getTextStyle(value), [value]);

  return (
    <ThemeContext.Provider value={value}>
      <TextStyleProvider value={textStyle}>{children}</TextStyleProvider>
    </ThemeContext.Provider>
  );
};
