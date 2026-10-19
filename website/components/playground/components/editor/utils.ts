import type { EffectItem } from 'fluxdown';

import {
  BaseSmoothTicker,
  type PerceptualSpring,
  type SmoothSchedulerClass,
  type SmoothTickerClass,
  SpringSmoothScheduler,
} from '@fluxdown/core-presets/mapper';

import type { AnimationSpeed, EditorEffect, EditorTuning } from './type';

import { CHUNK_DURATION, EFFECT_DURATION } from './consts';

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

export interface TunableSpring {
  /**
   * Scheduler class whose instances read the current spring.
   */
  Scheduler: SmoothSchedulerClass;

  /**
   * Change the spring without a jump: the running trajectory is pinned first, so new parameters
   * only shape the motion from this moment on.
   */
  retune: (spring: PerceptualSpring) => void;
}

export const createTunableSpring = (initial: PerceptualSpring): TunableSpring => {
  let spring = initial;

  let current: TunedSpringScheduler | null = null;

  const attach = (scheduler: TunedSpringScheduler) => {
    current = scheduler;
  };

  class TunedSpringScheduler extends SpringSmoothScheduler {
    constructor(tuple?: number[]) {
      super(tuple);

      attach(this);
    }

    override get tuple() {
      return [spring.frequency, spring.dampingRatio];
    }

    pin() {
      // An empty push rebases the trajectory at the latest timestamp under the current spring.
      this.push(0);
    }
  }

  return {
    Scheduler: TunedSpringScheduler,
    retune: (next) => {
      current?.pin();

      spring = next;
    },
  };
};

/**
 * Streaming effect configuration with wall-clock durations stretched for `speed`.
 */
export const getEffectConfig = (
  effect: EditorEffect,
  speed: AnimationSpeed,
  tuning: EditorTuning,
): false | EffectItem => {
  switch (effect) {
    case 'none':
      return false;
    case 'shad':
      return ['shad', { length: tuning.fadeLength, hideDelay: EFFECT_DURATION / speed }];
    case 'scale':
      return ['scale', { duration: tuning.entranceDuration / speed }];
    case 'chunk':
      return ['chunk', { duration: CHUNK_DURATION / speed }];
    case 'suffix-cursor':
    case 'suffix-dot':
      return ['suffix', { type: effect === 'suffix-cursor' ? 'cursor' : 'dot' }];
  }
};

export const getDampingKind = (dampingRatio: number) => {
  if (Math.abs(dampingRatio - 1) < 1e-6) {
    return 'critical';
  }

  return dampingRatio < 1 ? 'underdamped' : 'overdamped';
};
