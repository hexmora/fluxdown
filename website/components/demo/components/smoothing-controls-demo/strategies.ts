import {
  BaseSmoothInterpolator,
  IntervalSmoothDriver,
} from '@fluxdown/core-plugins/plugins/mapper/smooth';

export class FastDriver extends IntervalSmoothDriver {
  constructor() {
    super(50);
  }
}

export class SlowDriver extends IntervalSmoothDriver {
  constructor() {
    super(160);
  }
}

export class CoarseDriver extends IntervalSmoothDriver {
  constructor() {
    super(320);
  }
}

export class SteadyDriver extends IntervalSmoothDriver {
  constructor() {
    super(80);
  }
}

export class StepInterpolator extends BaseSmoothInterpolator {
  protected readonly defaultTuple = [2];

  private position = 0;

  override get idle() {
    return this.position >= this.fullIndex;
  }

  override reset(index = 0) {
    super.reset(index);
    this.position = index;
  }

  start(_timestamp: number, index = 0) {
    this.reset(index);
  }

  // A fixed step has no elapsed time or momentum to restore.
  override resume(_timestamp: number) {}

  tick(_timestamp: number) {
    const [step = 2] = this.tuple;
    const distance = Math.min(step, this.fullIndex - this.position);
    this.position += distance;
    return distance;
  }
}

export class SmallStepInterpolator extends StepInterpolator {
  protected override readonly defaultTuple = [1];
}

export class LargeStepInterpolator extends StepInterpolator {
  protected override readonly defaultTuple = [4];
}
