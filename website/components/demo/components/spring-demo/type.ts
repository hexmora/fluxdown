import type { SpringSmoothInterpolator } from '@fluxdown/core-presets/mapper';

export type SpringCursorParams = {
  text: string;

  source: string;

  cycle: number;

  active: boolean;

  reducedMotion: boolean | null;
};

export type SpringPlayback = {
  source: string;

  cycle: number;

  interpolator: SpringSmoothInterpolator;

  received: number;

  visible: number;
};
