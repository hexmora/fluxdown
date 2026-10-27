import { isString } from 'lodash-es';
import { computed } from 'vue';

import type { Theme } from '../types';

import { PRESET_STYLES } from './consts';
import { mapTokensToStyles, resolveTheme } from './utils';

export const useThemeStyles = (theme: () => Theme = () => 'light') =>
  computed(() => {
    const value = theme();

    return isString(value) ? PRESET_STYLES[value] : mapTokensToStyles(resolveTheme(value).tokens);
  });
