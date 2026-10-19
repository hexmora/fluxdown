export interface IScheduler {
  /**
   * Configuration values interpreted by the scheduler implementation.
   */
  readonly tuple: number[];

  /**
   * Whether ticking can stop after the visible cursor reaches the target.
   * Return false while idle frames still change the state used by later appends.
   */
  readonly idle: boolean;

  /**
   * Add newly available visible units to the target position.
   */
  push(length: number): void;

  /**
   * Reset progress and the target to the supplied absolute position.
   * @default index 0
   */
  reset(index?: number): void;

  /**
   * Start timing at the supplied timestamp and absolute position.
   * @default index 0
   */
  start(timestamp: number, index?: number): void;

  /**
   * Resume timing after an idle pause at the current target.
   * Implementations may retain momentum or restart timing from that position.
   */
  resume(timestamp: number): void;

  /**
   * Return the nonnegative number of visible units to advance at this timestamp.
   */
  tick(timestamp: number): number;
}

/**
 * Spring described by how it feels: speed and bounciness.
 */
export interface PerceptualSpring {
  /**
   * Undamped angular frequency ω = √(k / m) in rad/s. Higher values move faster.
   */
  frequency: number;

  /**
   * Damping ratio ζ = c / (2√(km)): below 1 overshoots, 1 is critical, above 1 settles without overshoot.
   */
  dampingRatio: number;
}

/**
 * Spring described by its physical coefficients.
 */
export interface PhysicalSpring {
  /**
   * Stiffness k in N/m.
   */
  stiffness: number;

  /**
   * Damping coefficient c in N·s/m.
   */
  damping: number;

  /**
   * Mass m in kg.
   */
  mass: number;
}

/**
 * State of a spring relative to its rest position.
 */
export interface SpringMotion {
  /**
   * Signed distance from the rest position.
   */
  displacement: number;

  /**
   * Rate of change of the displacement per second.
   */
  velocity: number;
}

/**
 * Snapshot of a spring scheduler for inspection.
 */
export interface SpringSchedulerMotion {
  /**
   * Unrounded spring position in visible units.
   */
  position: number;

  /**
   * Spring velocity in visible units per second.
   */
  velocity: number;

  /**
   * Absolute position the spring is pulling toward.
   */
  target: number;

  /**
   * Integer position already reported by `tick`.
   */
  cursor: number;
}
