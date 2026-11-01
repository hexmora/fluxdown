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
   * An optional arrival timestamp uses the same clock as start() and tick().
   * Progress accumulated at arrival is returned by the next tick().
   */
  push(length: number, timestamp?: number): void;

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
