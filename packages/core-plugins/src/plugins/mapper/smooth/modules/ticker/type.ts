import type { Observable } from 'rxjs';
import type { IDestructible } from 'stative';

export interface ITicker extends IDestructible {
  /**
   * Whether the ticker currently schedules timestamp events.
   */
  readonly running: boolean;

  /**
   * Timestamp events emitted while running.
   */
  readonly value: Observable<number>;

  /**
   * Start ticking and return the initial timestamp.
   */
  start(): number;

  /**
   * Stop ticking and cancel pending work.
   */
  stop(): void;
}
