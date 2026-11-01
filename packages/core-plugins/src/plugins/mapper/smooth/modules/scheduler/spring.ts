import { clamp, isUndefined } from 'lodash-es';

import { BaseSmoothScheduler } from './base';

export class SpringSmoothScheduler extends BaseSmoothScheduler {
  /**
   * Initial speed, buffer size, elasticity, resume speed, and maximum speed.
   * @default [20, 15, 1 / 700 / 1000, 2, 100_000]
   */
  protected readonly defaultTuple = [20, 15, 1 / 700 / 1000, 2, 100_000];

  private timestamp?: number;

  private position = 0;

  private speed = 0;

  private remainder = 0;

  private pendingDistance = 0;

  static get name() {
    return 'spring';
  }

  override get idle() {
    const [, , , resumeSpeed] = this.tuple;

    return this.position >= this.fullIndex && this.speed <= resumeSpeed / 1000;
  }

  override push(length: number, timestamp?: number) {
    if (!isUndefined(timestamp) && !isUndefined(this.timestamp)) {
      // Advance against the old target, but emit progress only on the next tick.
      this.pendingDistance += this.advance(timestamp);
    }

    super.push(length);
  }

  override reset(index = 0) {
    super.reset(index);

    const [initialSpeed] = this.tuple;

    this.position = index;

    this.speed = initialSpeed / 1000;

    this.remainder = 0;

    this.pendingDistance = 0;
  }

  start(timestamp: number, index = 0) {
    this.reset(index);

    this.timestamp = timestamp;
  }

  override resume(timestamp: number) {
    this.timestamp = timestamp;
  }

  tick(timestamp: number) {
    const distance = this.pendingDistance + this.advance(timestamp);

    this.pendingDistance = 0;

    return distance;
  }

  private decay(elapsed: number) {
    const [, , , resumeSpeed] = this.tuple;

    this.speed = Math.max(this.speed * 0.9 ** (elapsed / (1000 / 60)), resumeSpeed / 1000);

    if (this.speed < 0.5 / 1000) {
      this.speed = 0;
    }
  }

  private advance(timestamp: number) {
    if (isUndefined(this.timestamp)) {
      throw new Error('Cannot tick without call start');
    }

    const elapsed = timestamp - this.timestamp;

    if (elapsed <= 0) {
      return 0;
    }

    this.timestamp = timestamp;

    const [, buffer, elasticity, resumeSpeed, maximumSpeed] = this.tuple;

    if (this.position >= this.fullIndex) {
      this.decay(elapsed);

      return 0;
    }

    const destination = Math.max(buffer, this.fullIndex - buffer);

    this.speed = clamp(
      this.speed + (destination - this.position) * elasticity * elapsed,
      resumeSpeed / 1000,
      maximumSpeed / 1000,
    );

    if (this.speed < 0.5 / 1000) {
      this.speed = 0;
    }

    const nextPosition = Math.min(this.fullIndex, this.position + this.speed * elapsed);

    if (nextPosition === this.fullIndex) {
      // Only the remaining part of this interval was spent at the buffer wall.
      this.decay(Math.max(0, elapsed - (this.fullIndex - this.position) / this.speed));
    }

    const progress = this.remainder + Math.max(0, nextPosition - this.position);

    const distance = Math.floor(progress);

    this.remainder = progress - distance;

    this.position = nextPosition;

    return distance;
  }
}
