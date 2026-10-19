import type {
  IBlockState,
  MapperConfigInputs,
  MapperInputs,
  MapperPluginConfig,
} from '@fluxdown/types';
import type { Newable } from 'stative';

import type { IScheduler, ITicker } from './modules';

export type TickerParams = [interval?: number];

export type SchedulerParams = [tuple?: number[]];

export type TickerType = 'raf' | 'interval';

export type SchedulerType = 'spring';

export type SmoothTickerClass = Newable<ITicker, TickerParams>;

export type SmoothSchedulerClass = Newable<IScheduler, SchedulerParams>;

export interface SmoothConfig {
  /**
   * Reveal newly compiled content over successive ticks.
   * @default false
   */
  enabled?: boolean;

  /**
   * Constructor used to supply animation timestamps.
   * @default RafSmoothTicker when animation frames are available, otherwise IntervalSmoothTicker
   */
  ticker?: SmoothTickerClass;

  /**
   * Constructor used to determine visible progress per tick.
   * @default SpringSmoothScheduler
   */
  scheduler?: SmoothSchedulerClass;
}

export type BaseSmoothConfig = Required<SmoothConfig>;

export type SmoothBaseInputs = MapperConfigInputs<SmoothConfig>;

export type SmoothInputs<T> = MapperInputs<SmoothBaseInputs, IBlockState<T>[]>;

export type SmoothPluginConfig = MapperPluginConfig<SmoothConfig>;
