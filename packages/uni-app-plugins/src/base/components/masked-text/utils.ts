import { clamp } from 'lodash-es';

import type { MaskFrame, MaskFrameInputs } from './type';

import { BAND_WIDTH } from './consts';

export const getMaskFrame = (
  { width, height, maskWidth, maskEnd, padding, pixelRatio }: MaskFrameInputs,
  minimumStart = -Infinity,
): MaskFrame => {
  const step = Math.max(1, Math.round(BAND_WIDTH * pixelRatio)) / pixelRatio;

  const left = -Math.ceil(padding / step) * step;

  const right = Math.ceil((width + padding) * pixelRatio) / pixelRatio;

  const start =
    maskWidth > 0
      ? clamp(Math.max(minimumStart, Math.floor((maskEnd - maskWidth) / step) * step), left, right)
      : right;

  const end = maskWidth > 0 ? clamp(Math.ceil(maskEnd / step) * step, start, right) : start;

  return {
    width,
    height,
    left,
    step,
    start,
    maskWidth,
    maskEnd,
    prefixWidth: start - left,
    activeWidth: end - start,
  };
};

export const getBandOpacity = (frame: MaskFrame, index: number) => {
  return frame.maskWidth > 0
    ? clamp((frame.maskEnd - frame.start - (index - 0.5) * frame.step) / frame.maskWidth, 0, 1)
    : 1;
};
