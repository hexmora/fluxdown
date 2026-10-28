import { assert } from '@fluxdown/utils';

import { BaseSmoothTicker } from './base';
import { getNow } from './utils';

export class RafSmoothTicker extends BaseSmoothTicker {
  private frame: number | null = null;

  private generation = 0;

  static get name() {
    return 'raf';
  }

  get running() {
    return this.frame !== null;
  }

  start() {
    assert(!this.destroyed, 'Cannot start a destroyed ticker');

    assert(!this.running, 'Cannot start a running ticker');

    const timestamp = getNow();

    const generation = ++this.generation;

    const next = () => {
      if (!this.running || generation !== this.generation) {
        return;
      }

      // Native RAF callbacks may use a different clock origin from start().
      this.subject.next(getNow());

      if (this.running && generation === this.generation) {
        this.frame = requestAnimationFrame(next);
      }
    };

    this.frame = requestAnimationFrame(next);

    return timestamp;
  }

  stop() {
    assert(this.frame !== null, 'Cannot stop a stopping ticker');

    cancelAnimationFrame(this.frame);

    this.frame = null;

    this.generation += 1;
  }
}
