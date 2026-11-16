// Names from before the driver and interpolation rename, kept for one release.

import type { IDriver } from './driver';
import type { IInterpolator, SpringInterpolatorMotion } from './interpolation';

import { BaseSmoothDriver, IntervalSmoothDriver, RafSmoothDriver } from './driver';
import { BaseSmoothInterpolator, SpringSmoothInterpolator } from './interpolation';

/** @deprecated Renamed to `BaseSmoothDriver`. */
export const BaseSmoothTicker = BaseSmoothDriver;

/** @deprecated Renamed to `BaseSmoothDriver`. */
export type BaseSmoothTicker = BaseSmoothDriver;

/** @deprecated Renamed to `RafSmoothDriver`. */
export const RafSmoothTicker = RafSmoothDriver;

/** @deprecated Renamed to `RafSmoothDriver`. */
export type RafSmoothTicker = RafSmoothDriver;

/** @deprecated Renamed to `IntervalSmoothDriver`. */
export const IntervalSmoothTicker = IntervalSmoothDriver;

/** @deprecated Renamed to `IntervalSmoothDriver`. */
export type IntervalSmoothTicker = IntervalSmoothDriver;

/** @deprecated Renamed to `BaseSmoothInterpolator`. */
export const BaseSmoothScheduler = BaseSmoothInterpolator;

/** @deprecated Renamed to `BaseSmoothInterpolator`. */
export type BaseSmoothScheduler = BaseSmoothInterpolator;

/** @deprecated Renamed to `SpringSmoothInterpolator`. */
export const SpringSmoothScheduler = SpringSmoothInterpolator;

/** @deprecated Renamed to `SpringSmoothInterpolator`. */
export type SpringSmoothScheduler = SpringSmoothInterpolator;

/** @deprecated Renamed to `IDriver`. */
export type ITicker = IDriver;

/** @deprecated Renamed to `IInterpolator`. */
export type IScheduler = IInterpolator;

/** @deprecated Renamed to `SpringInterpolatorMotion`. */
export type SpringSchedulerMotion = SpringInterpolatorMotion;
