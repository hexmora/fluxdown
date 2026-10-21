import type {
  IBlockState,
  MapperConfigInputs,
  MapperInputs,
  MapperPluginConfig,
} from '@fluxdown/types';
import type { Newable } from 'stative';

import type { IDriver, IInterpolator } from './modules';

export type DriverParams = [interval?: number];

export type InterpolatorParams = [tuple?: number[]];

export type DriverType = 'raf' | 'interval';

export type InterpolationType = 'spring';

export type SmoothDriverClass = Newable<IDriver, DriverParams>;

export type SmoothInterpolatorClass = Newable<IInterpolator, InterpolatorParams>;

export interface SmoothConfig {
  /**
   * Reveal newly compiled content over successive ticks.
   * @default false
   */
  enabled?: boolean;

  /**
   * Constructor used to supply animation timestamps.
   * @default RafSmoothDriver when animation frames are available, otherwise IntervalSmoothDriver
   */
  driver?: SmoothDriverClass;

  /**
   * Constructor used to determine visible progress per tick.
   * @default SpringSmoothInterpolator
   */
  interpolation?: SmoothInterpolatorClass;
}

/**
 * Option names from before the driver and interpolation rename, accepted for one release.
 */
export interface DeprecatedSmoothConfig {
  /**
   * @deprecated Renamed to `driver`.
   */
  ticker?: SmoothDriverClass;

  /**
   * @deprecated Renamed to `interpolation`.
   */
  scheduler?: SmoothInterpolatorClass;
}

export type BaseSmoothConfig = Required<SmoothConfig>;

export type SmoothBaseInputs = MapperConfigInputs<SmoothConfig & DeprecatedSmoothConfig>;

export type SmoothInputs<T> = MapperInputs<SmoothBaseInputs, IBlockState<T>[]>;

export type SmoothPluginConfig = MapperPluginConfig<SmoothConfig & DeprecatedSmoothConfig>;

/** @deprecated Renamed to `DriverParams`. */
export type TickerParams = DriverParams;

/** @deprecated Renamed to `InterpolatorParams`. */
export type SchedulerParams = InterpolatorParams;

/** @deprecated Renamed to `DriverType`. */
export type TickerType = DriverType;

/** @deprecated Renamed to `InterpolationType`. */
export type SchedulerType = InterpolationType;

/** @deprecated Renamed to `SmoothDriverClass`. */
export type SmoothTickerClass = SmoothDriverClass;

/** @deprecated Renamed to `SmoothInterpolatorClass`. */
export type SmoothSchedulerClass = SmoothInterpolatorClass;
