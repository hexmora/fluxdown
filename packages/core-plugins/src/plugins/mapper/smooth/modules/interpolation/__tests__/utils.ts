import { BaseSmoothInterpolator } from '..';

export class TargetInterpolator extends BaseSmoothInterpolator {
  protected readonly defaultTuple = [1, 2];

  start(_timestamp: number, index = 0) {
    this.reset(index);
  }

  tick(_timestamp: number) {
    return this.fullIndex;
  }
}

export class StepSmoothInterpolator extends BaseSmoothInterpolator {
  static instances: StepSmoothInterpolator[] = [];

  protected readonly defaultTuple = [1];

  readonly startCalls: {
    timestamp: number;

    index: number;
  }[] = [];

  private cursor = 0;

  constructor() {
    super();

    StepSmoothInterpolator.instances.push(this);
  }

  override get idle() {
    return true;
  }

  override reset(index = 0) {
    super.reset(index);

    this.cursor = index;
  }

  start(timestamp: number, index = 0) {
    this.startCalls.push({ timestamp, index });

    this.reset(index);
  }

  tick(_timestamp: number) {
    const [step = 1] = this.tuple;

    const distance = Math.min(step, this.fullIndex - this.cursor);

    this.cursor += distance;

    return distance;
  }
}

export class DoubleStepSmoothInterpolator extends StepSmoothInterpolator {
  static override instances: DoubleStepSmoothInterpolator[] = [];

  protected override readonly defaultTuple = [2];

  constructor() {
    super();

    DoubleStepSmoothInterpolator.instances.push(this);
  }
}
