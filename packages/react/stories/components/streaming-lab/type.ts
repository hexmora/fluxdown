export type AnimationSpeed = 0.1 | 0.25 | 0.5 | 1;

export type LabDriver = 'raf' | 'interval';

export type LabEffect = 'none' | 'shad' | 'scale';

export interface StreamingLabSettings {
  smooth: boolean;

  driver: LabDriver;

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

  /**
   * Characters the trailing fade aims to keep fading at once.
   */
  shadLength: number;

  /**
   * Longest per-character fade in milliseconds at 1×.
   */
  shadDuration: number;

  /**
   * Scale entrance duration in milliseconds at 1×.
   */
  scaleDuration: number;

  scaleFrom: number;

  scaleBlur: number;
}

/**
 * One recorded interpolator state, in playback-clock milliseconds.
 */
export interface SpringSample {
  time: number;

  target: number;

  position: number;

  velocity: number;
}

export interface SpringSnapshot {
  /**
   * Whether an interpolator instance has been created for the current preview.
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
