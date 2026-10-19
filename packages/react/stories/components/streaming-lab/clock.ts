import { BaseSmoothTicker, type SmoothTickerClass } from '@fluxdown/core-presets/mapper';

import type { LabTicker } from './type';

import { INTERVAL_TICKER_PERIOD } from './consts';

/**
 * Virtual time that advances at an adjustable rate. Changing the rate keeps the current reading,
 * so time-driven animations slow down or speed up without jumping.
 */
export class PlaybackClock {
  private rate = 1;

  private origin = { real: 0, virtual: 0 };

  now(real = performance.now()) {
    return this.origin.virtual + (real - this.origin.real) * this.rate;
  }

  setRate(rate: number) {
    const real = performance.now();

    this.origin = { real, virtual: this.now(real) };

    this.rate = rate;
  }
}

/**
 * Create a ticker that reports `clock` time on animation frames or on a fixed interval.
 * The class stays the same when the clock rate changes, so the scheduler keeps its motion.
 */
export const createClockTicker = (clock: PlaybackClock, schedule: LabTicker): SmoothTickerClass =>
  class ClockSmoothTicker extends BaseSmoothTicker {
    private handle: number | null = null;

    private generation = 0;

    get running() {
      return this.handle !== null;
    }

    start() {
      const generation = ++this.generation;

      if (schedule === 'interval') {
        this.handle = window.setInterval(
          () => this.subject.next(clock.now()),
          INTERVAL_TICKER_PERIOD,
        );

        return clock.now();
      }

      const next = (time: number) => {
        if (generation !== this.generation) {
          return;
        }

        this.subject.next(clock.now(time));

        // A subscriber may stop or restart the ticker while handling this frame.
        if (generation === this.generation) {
          this.handle = requestAnimationFrame(next);
        }
      };

      this.handle = requestAnimationFrame(next);

      return clock.now();
    }

    stop() {
      if (this.handle !== null) {
        if (schedule === 'interval') {
          window.clearInterval(this.handle);
        } else {
          cancelAnimationFrame(this.handle);
        }
      }

      this.handle = null;

      this.generation += 1;
    }
  };
