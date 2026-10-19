import type { EffectItem } from 'fluxdown';

import { BaseSmoothTicker, type SmoothTickerClass } from '@fluxdown/core-presets/mapper';

import type { AnimationSpeed, EditorEffect } from './type';

import { EFFECT_DURATION } from './consts';

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
 * Create an animation-frame ticker that reports timestamps from `clock`.
 * The class stays the same when the clock rate changes, so the smooth scheduler keeps its motion.
 */
export const createClockTicker = (clock: PlaybackClock): SmoothTickerClass =>
  class ClockSmoothTicker extends BaseSmoothTicker {
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

        // A subscriber may stop or restart the ticker while handling this frame.
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

/**
 * Streaming effect configuration with wall-clock durations stretched for `speed`.
 */
export const getEffectConfig = (
  effect: Exclude<EditorEffect, 'none'>,
  speed: AnimationSpeed,
): EffectItem =>
  effect === 'shad'
    ? ['shad', { hideDelay: EFFECT_DURATION / speed }]
    : ['scale', { duration: EFFECT_DURATION / speed }];
