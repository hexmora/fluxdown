import { isString } from 'lodash-es';
import { createMemo } from 'solid-js';

import type { Theme } from '../types';

import { PRESET_STYLES } from './consts';
import { mapTokensToStyles, resolveTheme } from './utils';

export const createThemeStyles = (theme: () => Theme = () => 'light') => {
  return createMemo(() => {
    const value = theme();

    return isString(value) ? PRESET_STYLES[value] : mapTokensToStyles(resolveTheme(value).tokens);
  });
};
