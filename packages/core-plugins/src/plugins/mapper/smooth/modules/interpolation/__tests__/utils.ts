import { sortBy } from 'lodash-es';

import { BaseSmoothInterpolator, SpringSmoothInterpolator } from '..';

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

/**
 * Moves at one unit per millisecond toward the target that was available at each moment.
 */
export class LinearSmoothInterpolator extends BaseSmoothInterpolator {
  protected readonly defaultTuple = [];

  private origin = { time: 0, position: 0 };

  private cursor = 0;

  override get idle() {
    return true;
  }

  override push(length: number, timestamp = this.origin.time) {
    this.origin = { time: timestamp, position: this.sample(timestamp) };

    super.push(length);
  }

  start(timestamp: number, index = 0) {
    this.reset(index);

    this.cursor = index;

    this.origin = { time: timestamp, position: index };
  }

  tick(timestamp: number) {
    const distance = Math.floor(this.sample(timestamp)) - this.cursor;

    this.cursor += distance;

    return distance;
  }

  private sample(time: number) {
    return Math.min(this.fullIndex, this.origin.position + Math.max(0, time - this.origin.time));
  }
}

export const getArrivalCompletion = (arrival: number, firstFrame: number, phase: number) => {
  const interpolator = new SpringSmoothInterpolator();

  // A trailing space joins the next character, producing the observed 5→7 and 16→18 targets.
  const arrivals = Array.from({ length: 35 }, (_, index) => index)
    .filter((index) => ![5, 10, 16, 22].includes(index))
    .map((index) => ({ timestamp: index === 0 ? arrival : index * 60 + 3, total: index + 1 }));

  const frames = [
    firstFrame,
    ...Array.from({ length: 400 }, (_, index) => phase + (index * 1000) / 60),
  ].map((timestamp) => ({ timestamp, total: undefined }));

  const events = sortBy([...arrivals, ...frames], 'timestamp');

  let available = 0;

  let cursor = 0;

  interpolator.start(arrival);

  for (const event of events) {
    if (event.total !== undefined) {
      interpolator.push(event.total - available, event.timestamp);

      available = event.total;
    } else {
      cursor += interpolator.tick(event.timestamp);

      expect(cursor).toBeLessThanOrEqual(available);

      if (cursor === 35) {
        return event.timestamp;
      }
    }
  }

  throw new Error('The stream did not reach its target.');
};
