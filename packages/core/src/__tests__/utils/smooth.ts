import {
  BaseSmoothDriver,
  BaseSmoothInterpolator,
} from '@fluxdown/core-plugins/plugins/mapper/smooth';

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

export class FakeSmoothDriver extends BaseSmoothDriver {
  destroyCalls = 0;

  private active = false;

  private timestamp: number;

  constructor(timestamp = 0) {
    super();

    this.timestamp = timestamp;
  }

  override get running() {
    return this.active;
  }

  start() {
    if (this.active) {
      throw new Error('Cannot start a running driver');
    }

    this.active = true;

    return this.timestamp;
  }

  stop() {
    if (!this.active) {
      throw new Error('Cannot stop a stopping driver');
    }

    this.active = false;
  }

  tick(timestamp: number) {
    if (!this.active) {
      throw new Error('Cannot tick a stopping driver');
    }

    if (timestamp < this.timestamp) {
      throw new Error('Cannot tick previous timestamp');
    }

    this.timestamp = timestamp;

    this.subject.next(timestamp);
  }

  override destroy() {
    if (this.destroyed) {
      return;
    }

    this.destroyCalls += 1;

    super.destroy();
  }
}
