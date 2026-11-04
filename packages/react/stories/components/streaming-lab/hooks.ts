import { useMemo, useRef, useState } from 'react';

import type { EffectItem, StreamingConfig } from '../../../src/packs/full';
import type { StreamingLabSettings } from './type';

import { createClockDriver, PlaybackClock } from './clock';
import { DEFAULT_LAB_SETTINGS } from './consts';
import { createSpringInspector } from './spring-inspector';

const getEffect = (settings: StreamingLabSettings): EffectItem | false => {
  // Effect durations are wall-clock milliseconds, so they stretch with the playback rate.
  switch (settings.effect) {
    case 'shad':
      return [
        'shad',
        {
          length: settings.shadLength,
          duration: settings.shadDuration / settings.speed,
        },
      ];
    case 'scale':
      return [
        'scale',
        {
          duration: settings.scaleDuration / settings.speed,
          from: settings.scaleFrom,
          blur: settings.scaleBlur,
        },
      ];
    default:
      return false;
  }
};

/**
 * Streaming configuration with a slow-motion clock, a live-tunable spring, and an inspector.
 */
export const useStreamingLab = (initial: Partial<StreamingLabSettings> = {}) => {
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_LAB_SETTINGS, ...initial }));

  // Created once so speed and spring changes reach the running interpolator without replacing it.
  const [lab] = useState(() => {
    const clock = new PlaybackClock();

    clock.setRate(settings.speed);

    return {
      clock,
      drivers: {
        raf: createClockDriver(clock, 'raf'),
        interval: createClockDriver(clock, 'interval'),
      },
      inspector: createSpringInspector(settings),
    };
  });

  const settingsRef = useRef(settings);

  settingsRef.current = settings;

  const update = (patch: Partial<StreamingLabSettings>) => {
    const next = { ...settingsRef.current, ...patch };

    if (patch.speed !== undefined) {
      lab.clock.setRate(patch.speed);
    }

    if (patch.frequency !== undefined || patch.dampingRatio !== undefined) {
      lab.inspector.retune(next);
    }

    settingsRef.current = next;

    setSettings(next);
  };

  const streaming = useMemo(
    (): StreamingConfig => ({
      smooth: settings.smooth && {
        enabled: true,
        driver: lab.drivers[settings.driver],
        interpolation: lab.inspector.Interpolator,
      },
      effect: getEffect(settings),
    }),
    [lab, settings],
  );

  return {
    settings,
    update,
    reset: () => update(DEFAULT_LAB_SETTINGS),
    streaming,
    inspector: lab.inspector,
    clock: lab.clock,
  };
};

export type StreamingLab = ReturnType<typeof useStreamingLab>;
