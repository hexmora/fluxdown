import type { Observable } from 'rxjs';
import type { IDestructible } from 'stative';

export interface IDriver extends IDestructible {
  /**
   * Whether the driver currently schedules timestamp events.
   */
  readonly running: boolean;

  /**
   * Timestamp events emitted while running.
   */
  readonly value: Observable<number>;

  /**
   * Read the current time using the same clock as start() and timestamp events.
   */
  now(): number;

  /**
   * Start ticking and return the initial timestamp.
   */
  start(): number;

  /**
   * Stop ticking and cancel pending work.
   */
  stop(): void;
}
