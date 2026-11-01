import { sortBy } from 'lodash-es';

import { BaseSmoothScheduler, SpringSmoothScheduler } from '..';

export class TargetScheduler extends BaseSmoothScheduler {
  protected readonly defaultTuple = [1, 2];

  start(_timestamp: number, index = 0) {
    this.reset(index);
  }

  tick(_timestamp: number) {
    return this.fullIndex;
  }
}

export class StepSmoothScheduler extends BaseSmoothScheduler {
  static instances: StepSmoothScheduler[] = [];

  protected readonly defaultTuple = [1];

  readonly startCalls: {
    timestamp: number;

    index: number;
  }[] = [];

  private cursor = 0;

  constructor() {
    super();

    StepSmoothScheduler.instances.push(this);
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

export class DoubleStepSmoothScheduler extends StepSmoothScheduler {
  static override instances: DoubleStepSmoothScheduler[] = [];

  protected override readonly defaultTuple = [2];

  constructor() {
    super();

    DoubleStepSmoothScheduler.instances.push(this);
  }
}

export const getIdleDistances = (timestamps: number[]) => {
  const scheduler = new SpringSmoothScheduler([1000, 0, 0, 0, 1000]);

  scheduler.start(0);

  for (const timestamp of timestamps) {
    expect(scheduler.tick(timestamp)).toBe(0);
  }

  scheduler.push(100);

  return [110, 120, 130].map((timestamp) => scheduler.tick(timestamp));
};

export const getArrivalCompletion = (arrival: number, firstFrame: number, phase: number) => {
  const scheduler = new SpringSmoothScheduler();

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

  scheduler.start(arrival);

  for (const event of events) {
    if (event.total !== undefined) {
      scheduler.push(event.total - available, event.timestamp);

      available = event.total;
    } else {
      cursor += scheduler.tick(event.timestamp);

      expect(cursor).toBeLessThanOrEqual(available);

      if (cursor === 35) {
        return event.timestamp;
      }
    }
  }

  throw new Error('The stream did not reach its target.');
};
