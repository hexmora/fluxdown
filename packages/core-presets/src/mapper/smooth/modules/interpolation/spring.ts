import { assert } from '@fluxdown/utils';
import { isUndefined } from 'lodash-es';

import type { PerceptualSpring, SpringInterpolatorMotion } from './type';

import { BaseSmoothInterpolator } from './base';
import { getSpringMotion } from './utils';

interface SpringOrigin {
  /**
   * Timestamp in milliseconds where the current trajectory begins.
   */
  time: number;

  /**
   * Absolute position at that time.
   */
  position: number;

  /**
   * Velocity at that time, in units per second.
   */
  velocity: number;
}

export class SpringSmoothInterpolator extends BaseSmoothInterpolator {
  /**
   * Angular frequency ω in rad/s and damping ratio ζ.
   * Use `toPerceptualSpring` to derive them from stiffness, damping, and mass.
   * @default [5, 1]
   */
  protected readonly defaultTuple = [5, 1];

  /**
   * Latest timestamp received by `start`, `resume`, or `tick`.
   */
  private timestamp?: number;

  /**
   * Where the spring starts pulling toward the current target. Positions are sampled from this
   * point in closed form, so frame timing never accumulates integration or rounding error.
   */
  private origin: SpringOrigin = { time: 0, position: 0, velocity: 0 };

  /**
   * Integer position already reported by `tick`.
   */
  private cursor = 0;

  static get name() {
    return 'spring';
  }

  get spring(): PerceptualSpring {
    const [frequency = 0, dampingRatio = 0] = this.tuple;

    assert(
      [frequency, dampingRatio].every((value) => Number.isFinite(value) && value > 0),
      'Expected a positive spring frequency and damping ratio',
    );

    return { frequency, dampingRatio };
  }

  // The trajectory is a function of time, so frames skipped while paused leave nothing to catch up.
  override get idle() {
    return this.cursor >= this.fullIndex;
  }

  override push(length: number) {
    // Pin the motion toward the previous target before the target moves.
    if (!isUndefined(this.timestamp)) {
      this.rebase(this.timestamp);
    }

    super.push(length);
  }

  /**
   * Move progress and the target to `index`, keeping the current velocity.
   */
  override reset(index = 0) {
    const velocity = isUndefined(this.timestamp) ? 0 : this.sample(this.timestamp).velocity;

    super.reset(index);

    this.cursor = index;

    this.origin = { time: this.timestamp ?? 0, position: index, velocity };
  }

  /**
   * Start at rest at `index`.
   */
  start(timestamp: number, index = 0) {
    super.reset(index);

    this.timestamp = timestamp;

    this.cursor = index;

    this.origin = { time: timestamp, position: index, velocity: 0 };
  }

  override resume(timestamp: number) {
    this.assertStarted(this.timestamp);

    // The paused interval is evaluated in closed form when the trajectory is next sampled.
    this.timestamp = Math.max(this.timestamp, timestamp);
  }

  tick(timestamp: number) {
    this.assertStarted(this.timestamp);

    if (timestamp <= this.timestamp) {
      return 0;
    }

    this.timestamp = timestamp;

    // Rounding reveals the final unit once the spring is within half a unit of the target,
    // instead of waiting on an asymptote that never arrives.
    const position = Math.min(this.fullIndex, Math.round(this.sample(timestamp).position));

    const distance = Math.max(0, position - this.cursor);

    this.cursor += distance;

    return distance;
  }

  /**
   * Inspect the spring at `time`, which defaults to the latest timestamp. Sampling has no side
   * effects, so debugging tools can read it on every frame.
   */
  getMotion(time = this.timestamp ?? this.origin.time): SpringInterpolatorMotion {
    return { ...this.sample(time), target: this.fullIndex, cursor: this.cursor };
  }

  private assertStarted(timestamp?: number): asserts timestamp is number {
    if (isUndefined(timestamp)) {
      throw new Error('Cannot tick without call start');
    }
  }

  private sample(time: number): Omit<SpringOrigin, 'time'> {
    const { time: start, position, velocity } = this.origin;

    const motion = getSpringMotion(
      this.spring,
      { displacement: position - this.fullIndex, velocity },
      (time - start) / 1000,
    );

    return { position: this.fullIndex + motion.displacement, velocity: motion.velocity };
  }

  private rebase(time: number) {
    if (time !== this.origin.time) {
      this.origin = { time, ...this.sample(time) };
    }
  }
}
