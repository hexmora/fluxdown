import { SpringSmoothScheduler } from '@fluxdown/core-presets/plugins/mapper/smooth';
import { useEffect, useRef, useState } from 'react';

import type { SpringCursorParams, SpringPlayback } from './type';

export const useSpringCursor = ({
  text,
  source,
  cycle,
  active,
  reducedMotion,
}: SpringCursorParams) => {
  const playbackRef = useRef<SpringPlayback | null>(null);

  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    let playback = playbackRef.current;

    if (
      !playback ||
      playback.source !== source ||
      playback.cycle !== cycle ||
      text.length < playback.received
    ) {
      const scheduler = new SpringSmoothScheduler();

      scheduler.start(performance.now());

      playback = { source, cycle, scheduler, received: 0, visible: 0 };

      playbackRef.current = playback;

      setCursor(0);
    }

    playback.scheduler.push(text.length - playback.received);

    playback.received = text.length;

    if (!active || reducedMotion) {
      return;
    }

    playback.scheduler.resume(performance.now());

    let frame: number;

    const tick = (timestamp: number) => {
      const distance = playback.scheduler.tick(timestamp);

      if (distance > 0) {
        playback.visible = Math.min(playback.received, playback.visible + distance);

        setCursor(playback.visible);
      }

      if (!playback.scheduler.idle) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [active, cycle, reducedMotion, source, text]);

  return reducedMotion ? source.length : Math.min(cursor, text.length);
};
