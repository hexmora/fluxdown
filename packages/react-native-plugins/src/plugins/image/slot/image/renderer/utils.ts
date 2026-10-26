import type { DimensionValue } from 'react-native';

export const getDimension = (value?: number | string): DimensionValue | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : undefined;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  if (/^\d+(?:\.\d+)?%$/.test(value)) {
    return value as `${number}%`;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : undefined;
};
