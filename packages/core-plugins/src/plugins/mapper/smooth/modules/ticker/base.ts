import { Subject } from 'rxjs';
import { Destructible } from 'stative';

import type { ITicker } from './type';

import { getNow } from './utils';

export abstract class BaseSmoothTicker extends Destructible implements ITicker {
  protected readonly subject = new Subject<number>();

  readonly value = this.subject.asObservable();

  abstract get running(): boolean;

  abstract start(): number;

  abstract stop(): void;

  now() {
    return getNow();
  }

  override destroy() {
    if (this.destroyed) {
      return;
    }

    if (this.running) {
      this.stop();
    }

    this.subject.complete();

    super.destroy();
  }
}
