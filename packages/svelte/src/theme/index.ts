import { isString } from 'lodash-es';

import type { Theme } from '../types';

import { PRESET_STYLES } from './consts';
import { mapTokensToStyles, resolveTheme } from './utils';

export const toThemeStyles = (theme: Theme = 'light'): string => {
  const styles = isString(theme)
    ? PRESET_STYLES[theme]
    : mapTokensToStyles(resolveTheme(theme).tokens);

  return Object.entries(styles)
    .map(([key, value]) => `${key}:${value}`)
    .join(';');
};
