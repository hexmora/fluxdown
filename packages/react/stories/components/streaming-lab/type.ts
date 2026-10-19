export type AnimationSpeed = 0.1 | 0.25 | 0.5 | 1;

export type LabTicker = 'raf' | 'interval';

export type LabEffect = 'none' | 'shad' | 'scale';

export interface StreamingLabSettings {
  smooth: boolean;

  ticker: LabTicker;

  /**
   * Spring angular frequency ω in rad/s.
   */
  frequency: number;

  /**
   * Spring damping ratio ζ.
   */
  dampingRatio: number;

  /**
   * Playback rate applied to every clock in the lab.
   */
  speed: AnimationSpeed;

  effect: LabEffect;

  shadLength: number;

  maskWidth: number;

  /**
   * Trailing-fade hide delay in milliseconds at 1×.
   */
  hideDelay: number;

  /**
   * Scale entrance duration in milliseconds at 1×.
   */
  scaleDuration: number;

  scaleFrom: number;

  scaleBlur: number;
}

export interface SpringSnapshot {
  /**
   * Whether a scheduler instance has been created for the current preview.
   */
  attached: boolean;

  target: number;

  cursor: number;

  position: number;

  velocity: number;

  idle: boolean;

  ticks: number;

  /**
   * Clock time between the two latest ticks, in milliseconds.
   */
  frameInterval: number;

  lastEvent: string;
}
