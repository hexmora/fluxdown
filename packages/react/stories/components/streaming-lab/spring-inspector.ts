import {
  type PerceptualSpring,
  type SmoothInterpolatorClass,
  SpringSmoothInterpolator,
} from '@fluxdown/core-plugins/plugins/mapper/smooth';

import type { SpringSample, SpringSnapshot } from './type';

import { EMPTY_SNAPSHOT, HISTORY_LIMIT } from './consts';

export interface SpringInspector {
  /**
   * Interpolator class to pass to `streaming.smooth.interpolation`. Every instance reports to this
   * inspector and reads the inspector's current spring.
   */
  Interpolator: SmoothInterpolatorClass;

  subscribe: (listener: () => void) => () => void;

  getSnapshot: () => SpringSnapshot;

  /**
   * Recorded states, oldest first. The array is reused, so read it rather than keep it.
   */
  getHistory: () => readonly SpringSample[];

  /**
   * Change the spring without a jump: the current trajectory is pinned first, so the new
   * parameters only shape motion from this moment on.
   */
  retune: (spring: PerceptualSpring) => void;

  /**
   * Forget recorded motion and counters, for a stream that starts over. The interpolator itself
   * is untouched, so live readouts resume from its current state on the next frame.
   */
  clear: () => void;
}

export const createSpringInspector = (initial: PerceptualSpring): SpringInspector => {
  let spring = initial;

  let interpolator: InspectedSpringInterpolator | null = null;

  let snapshot = EMPTY_SNAPSHOT;

  let ticks = 0;

  let lastTick: number | undefined;

  let frameInterval = 0;

  let lastEvent = EMPTY_SNAPSHOT.lastEvent;

  const listeners = new Set<() => void>();

  const history: SpringSample[] = [];

  const record = () => {
    if (!interpolator || lastTick === undefined) {
      return;
    }

    const { target, position, velocity } = interpolator.getMotion();

    history.push({ time: lastTick, target, position, velocity });

    if (history.length > HISTORY_LIMIT) {
      history.splice(0, history.length - HISTORY_LIMIT);
    }
  };

  const attach = (instance: InspectedSpringInterpolator) => {
    interpolator = instance;

    history.length = 0;

    ticks = 0;

    lastTick = undefined;

    frameInterval = 0;

    publish('Interpolator created');
  };

  const publish = (event?: string) => {
    if (event) {
      lastEvent = event;
    }

    snapshot = interpolator
      ? {
          attached: true,
          ...interpolator.getMotion(),
          idle: interpolator.idle,
          ticks,
          frameInterval,
          lastEvent,
        }
      : { ...EMPTY_SNAPSHOT, lastEvent };

    for (const listener of listeners) {
      listener();
    }
  };

  class InspectedSpringInterpolator extends SpringSmoothInterpolator {
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

      // A restart begins a new trajectory; drop the old one so the chart does not join them.
      history.length = 0;

      record();

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
        record();

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

      record();

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
    Interpolator: InspectedSpringInterpolator,

    subscribe: (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },

    getSnapshot: () => snapshot,

    getHistory: () => history,

    clear: () => {
      history.length = 0;

      ticks = 0;

      frameInterval = 0;

      publish('Cleared for replay');
    },

    retune: (next) => {
      interpolator?.pin();

      spring = next;

      publish(`Retune ω ${next.frequency} · ζ ${next.dampingRatio}`);
    },
  };
};
