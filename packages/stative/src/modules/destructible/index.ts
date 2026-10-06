import type { DestructibleTarget, IDestructible } from './type';

import { clearByTarget } from './utils';

export * from './type';

export class Destructible implements IDestructible {
  private targets: DestructibleTarget[] | null = null;

  protected destroyed = false;

  protected clearable<T extends DestructibleTarget>(value: T): T {
    this.targets ??= [];

    this.targets.push(value);

    return value;
  }

  destroy() {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;

    const { targets } = this;

    if (!targets) {
      return;
    }

    for (const target of targets) {
      clearByTarget(target);
    }

    this.targets = null;
  }
}
