import { assert } from '@fluxdown/utils';

import { BaseSmoothDriver } from './base';
import { getNow } from './utils';

export class RafSmoothDriver extends BaseSmoothDriver {
  private frame: number | null = null;

  private generation = 0;

  static get name() {
    return 'raf';
  }

  get running() {
    return this.frame !== null;
  }

  start() {
    assert(!this.destroyed, 'Cannot start a destroyed driver');

    assert(!this.running, 'Cannot start a running driver');

    const timestamp = getNow();

    const generation = ++this.generation;

    const next = (time: number) => {
      if (!this.running || generation !== this.generation) {
        return;
      }

      this.subject.next(time);

      if (this.running && generation === this.generation) {
        this.frame = requestAnimationFrame(next);
      }
    };

    this.frame = requestAnimationFrame(next);

    return timestamp;
  }

  stop() {
    assert(this.frame !== null, 'Cannot stop a stopping driver');

    cancelAnimationFrame(this.frame);

    this.frame = null;

    this.generation += 1;
  }
}
