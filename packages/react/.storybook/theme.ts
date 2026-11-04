import { create, type ThemeVarsPartial } from 'storybook/theming';

const themeConfig: Omit<ThemeVarsPartial, 'base'> = {
  brandTitle: 'Fluxdown',
  // Stories always paint their own background. Transparent keeps the gaps shown during
  // overscroll and story switches on the manager color instead of a white frame.
  appPreviewBg: 'transparent',
};

export const managerThemeLight = create({ base: 'light', ...themeConfig });

export const managerThemeDark = create({ base: 'dark', ...themeConfig });
