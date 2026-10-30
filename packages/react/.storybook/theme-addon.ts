import type { Decorator, Preview } from '@storybook/react-vite';

import {
  createContext,
  createElement,
  useContext,
  useLayoutEffect,
  useSyncExternalStore,
} from 'react';

/**
 * Preview theme switcher: a toolbar global (`light`, `dark`, or `system`), the resolved theme
 * applied to the preview document, and a hook for stories that pass the theme as a prop.
 *
 * The addon sets `data-sb-color-scheme` on `<html>` and maps it to `color-scheme` through one
 * unlayered stylesheet, so native controls, scrollbars, and `light-dark()` follow the toolbar.
 * It also sets `data-theme` for stylesheets that key on it. An attribute is used instead of an
 * inline style so a story that sets its own `color-scheme` inline still wins.
 */

export type ResolvedTheme = 'light' | 'dark';

type ThemeOption = ResolvedTheme | 'system';

const COLOR_SCHEME_ATTRIBUTE = 'data-sb-color-scheme';

const STYLESHEET_ID = 'sb-theme-color-scheme';

const STYLESHEET = `
  :root[${COLOR_SCHEME_ATTRIBUTE}='light'] {
    color-scheme: light;
  }

  :root[${COLOR_SCHEME_ATTRIBUTE}='dark'] {
    color-scheme: dark;
  }
`;

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

const ensureStylesheet = () => {
  if (document.getElementById(STYLESHEET_ID)) {
    return;
  }

  const style = document.createElement('style');

  style.id = STYLESHEET_ID;

  style.textContent = STYLESHEET;

  document.head.append(style);
};

const subscribeToSystem = (onChange: () => void) => {
  const media = window.matchMedia(SYSTEM_DARK_QUERY);

  media.addEventListener('change', onChange);

  return () => media.removeEventListener('change', onChange);
};

const getSystemTheme = (): ResolvedTheme =>
  window.matchMedia(SYSTEM_DARK_QUERY).matches ? 'dark' : 'light';

const parseOption = (value: unknown): ThemeOption =>
  value === 'light' || value === 'dark' ? value : 'system';

const ResolvedThemeContext = createContext<ResolvedTheme | null>(null);

/**
 * The theme the preview is showing. Must be used inside the theme decorator.
 */
export const useResolvedTheme = (): ResolvedTheme => {
  const theme = useContext(ResolvedThemeContext);

  if (theme === null) {
    throw new Error('useResolvedTheme must be used inside the theme addon decorator');
  }

  return theme;
};

const WithTheme: Decorator = (Story, context) => {
  const option = parseOption(context.globals.theme);

  // Subscribed even when a theme is forced, so switching back to `system` is already current.
  const systemTheme = useSyncExternalStore(
    subscribeToSystem,
    getSystemTheme,
    () => 'light' as const,
  );

  const resolved = option === 'system' ? systemTheme : option;

  // A layout effect themes the first frame after a change.
  useLayoutEffect(() => {
    ensureStylesheet();

    const root = document.documentElement;

    root.setAttribute(COLOR_SCHEME_ATTRIBUTE, resolved);

    root.setAttribute('data-theme', resolved);
  }, [resolved]);

  return createElement(ResolvedThemeContext.Provider, { value: resolved }, createElement(Story));
};

export const decorators: Decorator[] = [WithTheme];

export const globalTypes = {
  theme: {
    description: 'Preview color theme',
    toolbar: {
      icon: 'mirror',
      items: [
        { value: 'light', title: 'Always Light' },
        { value: 'dark', title: 'Always Dark' },
        { value: 'system', title: 'Follow System' },
      ],
      dynamicTitle: true,
    },
  },
} satisfies NonNullable<Preview['globalTypes']>;

export const initialGlobals = { theme: 'system' };
