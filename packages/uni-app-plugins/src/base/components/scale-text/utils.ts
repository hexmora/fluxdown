import type { ScaleTextProps } from './type';

import { FRAMES } from './consts';

export const getScaleFrame = ({ from, blur, textStyle }: ScaleTextProps, progress: number) => {
  const eased = 1 - Math.pow(1 - progress, 3);

  const scale = from + (1 - from) * eased;

  const position = progress * (FRAMES.length - 1);

  const index = Math.floor(position);

  const current = FRAMES[index]!;

  const next = FRAMES[Math.min(index + 1, FRAMES.length - 1)]!;

  const ratio = position - index;

  const opacity =
    Number(textStyle.opacity ?? 1) * (current.opacity + (next.opacity - current.opacity) * ratio);

  const radius =
    blur *
    parseFloat(String(textStyle.fontSize ?? 16)) *
    (current.blur + (next.blur - current.blur) * ratio);

  return {
    scale,
    opacity,
    // Integer shadow lengths work on every target; negligible alpha avoids the zero-scale limit.
    blur: scale === 0 || opacity <= 1 / 255 ? null : Math.round((2 * radius) / scale),
  };
};
