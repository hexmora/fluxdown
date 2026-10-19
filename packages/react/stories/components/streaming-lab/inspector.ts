import {
  type PerceptualSpring,
  type SmoothSchedulerClass,
  SpringSmoothScheduler,
} from '@fluxdown/core-presets/mapper';

import type { SpringSnapshot } from './type';

import { EMPTY_SNAPSHOT } from './consts';

export interface SpringInspector {
  /**
   * Scheduler class to pass to `streaming.smooth.scheduler`. Every instance reports to this
   * inspector and reads the inspector's current spring.
   */
  Scheduler: SmoothSchedulerClass;

  subscribe: (listener: () => void) => () => void;

  getSnapshot: () => SpringSnapshot;

  /**
   * Change the spring without a jump: the current trajectory is pinned first, so the new
   * parameters only shape motion from this moment on.
   */
  retune: (spring: PerceptualSpring) => void;
}

export const createSpringInspector = (initial: PerceptualSpring): SpringInspector => {
  let spring = initial;

  let scheduler: InspectedSpringScheduler | null = null;

  let snapshot = EMPTY_SNAPSHOT;

  let ticks = 0;

  let lastTick: number | undefined;

  let frameInterval = 0;

  let lastEvent = EMPTY_SNAPSHOT.lastEvent;

  const listeners = new Set<() => void>();

  const attach = (instance: InspectedSpringScheduler) => {
    scheduler = instance;

    ticks = 0;

    lastTick = undefined;

    frameInterval = 0;

    publish('Scheduler created');
  };

  const publish = (event?: string) => {
    if (event) {
      lastEvent = event;
    }

    snapshot = scheduler
      ? {
          attached: true,
          ...scheduler.getMotion(),
          idle: scheduler.idle,
          ticks,
          frameInterval,
          lastEvent,
        }
      : { ...EMPTY_SNAPSHOT, lastEvent };

    for (const listener of listeners) {
      listener();
    }
  };

  class InspectedSpringScheduler extends SpringSmoothScheduler {
    constructor(tuple?: number[]) {
      super(tuple);

      attach(this);
    }

    override get tuple() {
      return [spring.frequency, spring.dampingRatio];
    }

    override start(timestamp: number, index = 0) {
      super.start(timestamp, index);

      lastTick = timestamp;

      publish(`Start at ${index}`);
    }

    override resume(timestamp: number) {
      super.resume(timestamp);

      lastTick = timestamp;

      publish('Resume after idle');
    }

    override reset(index = 0) {
      super.reset(index);

      publish(`Reset to ${index}`);
    }

    override push(length: number) {
      super.push(length);

      if (length !== 0) {
        publish(`Push +${length}`);
      }
    }

    override tick(timestamp: number) {
      const distance = super.tick(timestamp);

      ticks += 1;

      if (lastTick !== undefined) {
        frameInterval = timestamp - lastTick;
      }

      lastTick = timestamp;

      publish(this.idle ? 'Reached target' : undefined);

      return distance;
    }

    /**
     * Rebase at the latest timestamp under the current spring.
     */
    pin() {
      super.push(0);
    }
  }

  return {
    Scheduler: InspectedSpringScheduler,

    subscribe: (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },

    getSnapshot: () => snapshot,

    retune: (next) => {
      scheduler?.pin();

      spring = next;

      publish(`Retune ω ${next.frequency} · ζ ${next.dampingRatio}`);
    },
  };
};
