import { assert } from '@fluxdown/utils';

import { BaseSmoothDriver } from './base';

export class IntervalSmoothDriver extends BaseSmoothDriver {
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

  start() {
    assert(!this.destroyed, 'Cannot start a destroyed driver');

    assert(!this.running, 'Cannot start a running driver');

    const timestamp = this.now();

    this.timer = setInterval(() => this.subject.next(this.now()), this.interval);

    return timestamp;
  }

  stop() {
    assert(this.timer !== null, 'Cannot stop a stopping driver');

    clearInterval(this.timer);

    this.timer = null;
  }
}
