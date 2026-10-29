import type { Band, BandInputs } from './type';

import { BAND_WIDTH } from './consts';

export const toText = (value: string) => {
  // The suffix avoids native Text's approximate width for an isolated character.
  return `${value.replaceAll(' ', '\u00a0')}\u200b`;
};

export const getBands = ({ width, maskWidth, maskEnd, padding, pixelRatio }: BandInputs) => {
  if (width <= 0 || maskWidth <= 0) {
    return [];
  }

  const step = Math.max(1, Math.round(BAND_WIDTH * pixelRatio)) / pixelRatio;

  const leftIndex = -Math.ceil(padding / step);

  const left = leftIndex * step;

  const right = Math.ceil((width + padding) * pixelRatio) / pixelRatio;

  const index = Math.max(leftIndex, Math.floor((maskEnd - maskWidth) / step));

  const edge = Math.min(right, index * step);

  const bands: Band[] = [];

  if (edge > left) {
    bands.push({ key: 'prefix', left, width: edge - left, opacity: 1 });
  }

  for (let current = index; current * step < Math.min(right, maskEnd); current += 1) {
    const x = current * step;

    const size = Math.min(step, right - x, maskEnd - x);

    bands.push({
      key: `band-${current}`,
      left: x,
      width: size,
      opacity: Math.max(0, Math.min(1, (maskEnd - x - size / 2) / maskWidth)),
    });
  }

  return bands;
};
