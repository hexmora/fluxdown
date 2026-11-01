import { assert } from '@fluxdown/utils';

import { BaseSmoothTicker } from './base';
import { getNow } from './utils';

export class IntervalSmoothTicker extends BaseSmoothTicker {
  private timer: ReturnType<typeof setInterval> | null = null;

  static get name() {
    return 'interval';
  }

  constructor(private readonly interval = 1000 / 60) {
    super();
  }

  get running() {
    return this.timer !== null;
  }

  now() {
    return getNow();
  }

  start() {
    assert(!this.destroyed, 'Cannot start a destroyed ticker');

    assert(!this.running, 'Cannot start a running ticker');

    const timestamp = this.now();

    this.timer = setInterval(() => this.subject.next(this.now()), this.interval);

    return timestamp;
  }

  stop() {
    assert(this.timer !== null, 'Cannot stop a stopping ticker');

    clearInterval(this.timer);

    this.timer = null;
  }
}
