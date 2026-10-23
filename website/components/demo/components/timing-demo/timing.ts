import {
  IntervalSmoothTicker,
  SpringSmoothScheduler,
} from '@fluxdown/core-plugins/plugins/mapper/smooth';

export class ReadingTicker extends IntervalSmoothTicker {
  constructor() {
    super(240);
  }
}

export class SteadyScheduler extends SpringSmoothScheduler {
  constructor() {
    const speed = 32;

    super([speed, 0, 0, speed, speed]);
  }
}
