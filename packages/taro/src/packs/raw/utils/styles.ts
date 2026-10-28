import type { CSSProperties } from 'react';

import { styleStringToObject } from '@fluxdown/taro-plugins/base';
import { isString } from 'lodash-es';

export const mergeStyles = (
  theme: CSSProperties,
  style: string | CSSProperties | undefined,
): CSSProperties => {
  return { ...theme, ...(isString(style) ? styleStringToObject(style) : style) };
};
