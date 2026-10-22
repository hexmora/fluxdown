import type {
  SmoothSchedulerClass,
  SmoothTickerClass,
} from '@fluxdown/core-presets/plugins/mapper/smooth';

import {
  IntervalSmoothTicker,
  RafSmoothTicker,
  SpringSmoothScheduler,
} from '@fluxdown/core-presets/plugins/mapper/smooth';

export const ALL_TICKERS: SmoothTickerClass[] = [RafSmoothTicker, IntervalSmoothTicker];

export const ALL_SCHEDULERS: SmoothSchedulerClass[] = [SpringSmoothScheduler];
