import { addons } from 'storybook/manager-api';

import { managerThemeDark, managerThemeLight } from './theme';

// The manager follows the system appearance; the preview follows the toolbar theme.
const media = window.matchMedia('(prefers-color-scheme: dark)');

const updateManagerTheme = (dark: boolean) => {
  addons.setConfig({ theme: dark ? managerThemeDark : managerThemeLight });
};

media.addEventListener('change', (event) => updateManagerTheme(event.matches));

updateManagerTheme(media.matches);
