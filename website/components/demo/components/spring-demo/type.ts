import type { SpringSmoothScheduler } from '@fluxdown/core-presets/plugins/mapper/smooth';

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

  scheduler: SpringSmoothScheduler;

  received: number;

  visible: number;
};
