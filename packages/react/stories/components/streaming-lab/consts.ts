import type { AnimationSpeed, SpringSnapshot, StreamingLabSettings } from './type';

export const ANIMATION_SPEEDS: AnimationSpeed[] = [0.1, 0.25, 0.5, 1];

export const INTERVAL_TICKER_PERIOD = 16;

export const DEFAULT_LAB_SETTINGS: StreamingLabSettings = {
  smooth: true,
  ticker: 'raf',
  frequency: 5,
  dampingRatio: 1,
  speed: 1,
  effect: 'shad',
  shadLength: 10,
  maskWidth: 15,
  hideDelay: 200,
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
