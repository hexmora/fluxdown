import type { JSX } from 'solid-js';

import { isString } from 'lodash-es';

export const mergeStyles = (
  theme: JSX.CSSProperties,
  style: JSX.CSSProperties | string | undefined,
): JSX.CSSProperties | string => {
  if (!isString(style)) {
    return { ...theme, ...style };
  }

  const tokens = Object.entries(theme)
    .map(([name, value]) => `${name}:${value}`)
    .join(';');

  return `${tokens};${style}`;
};
