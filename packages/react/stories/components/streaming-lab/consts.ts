import type { AnimationSpeed, SpringSnapshot, StreamingLabSettings } from './type';

export const ANIMATION_SPEEDS: AnimationSpeed[] = [0.1, 0.25, 0.5, 1];

export const INTERVAL_DRIVER_PERIOD = 16;

/**
 * Samples kept for the live chart; enough for its window even on high-refresh displays.
 */
export const HISTORY_LIMIT = 6000;

/**
 * Playback-clock milliseconds shown across the live chart.
 */
export const CHART_WINDOW = 5000;

export const DEFAULT_LAB_SETTINGS: StreamingLabSettings = {
  smooth: true,
  driver: 'raf',
  frequency: 5,
  dampingRatio: 1,
  speed: 1,
  effect: 'shad',
  shadLength: 10,
  shadDuration: 400,
  scaleDuration: 200,
  scaleFrom: 0,
  scaleBlur: 0.08,
};

export const EMPTY_SNAPSHOT: SpringSnapshot = {
  attached: false,
  target: 0,
  cursor: 0,
  position: 0,
  velocity: 0,
  idle: true,
  ticks: 0,
  frameInterval: 0,
  lastEvent: 'Waiting for content',
};
