import {
  BaseSmoothDriver,
  type SmoothDriverClass,
} from '@fluxdown/core-presets/plugins/mapper/smooth';

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
 * Create an animation-frame driver that reports timestamps from `clock`.
 * The class stays the same when the clock rate changes, so the smooth interpolator keeps its motion.
 */
export const createClockDriver = (clock: PlaybackClock): SmoothDriverClass =>
  class ClockSmoothDriver extends BaseSmoothDriver {
    private frame: number | null = null;

    private generation = 0;

    get running() {
      return this.frame !== null;
    }

    start() {
      const generation = ++this.generation;

      const next = (time: number) => {
        if (generation !== this.generation) {
          return;
        }

        this.subject.next(clock.now(time));

        // A subscriber may stop or restart the driver while handling this frame.
        if (generation === this.generation) {
          this.frame = requestAnimationFrame(next);
        }
      };

      this.frame = requestAnimationFrame(next);

      return clock.now();
    }

    stop() {
      if (this.frame !== null) {
        cancelAnimationFrame(this.frame);
      }

      this.frame = null;

      this.generation += 1;
    }
  };
