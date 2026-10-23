import { useEffect, useRef, useState } from 'react';

import type { TimingCursorParams, TimingPlayback } from './type';

export const useTimingCursor = ({
  source,
  text,
  cycle,
  active,
  reducedMotion,
  Ticker,
  Scheduler,
}: TimingCursorParams) => {
  const playbackRef = useRef<TimingPlayback | null>(null);

  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const scheduler = new Scheduler();

    scheduler.start(0);

    const ticker = new Ticker();

    playbackRef.current = { ticker, scheduler, received: 0, visible: 0 };

    setCursor(0);

    return () => {
      ticker.destroy();

      playbackRef.current = null;
    };
  }, [cycle, source, Scheduler, Ticker]);

  useEffect(() => {
    const playback = playbackRef.current;

    if (!playback || !active || reducedMotion) {
      return;
    }

    const { ticker, scheduler } = playback;

    const subscription = ticker.value.subscribe((timestamp) => {
      const distance = scheduler.tick(timestamp);

      if (distance > 0) {
        playback.visible = Math.min(playback.received, playback.visible + distance);

        setCursor(playback.visible);
      }

      if (playback.visible === playback.received && scheduler.idle && ticker.running) {
        ticker.stop();
      }
    });

    return () => {
      subscription.unsubscribe();

      if (ticker.running) {
        ticker.stop();
      }
    };
  }, [active, cycle, reducedMotion, source, Scheduler, Ticker]);

  useEffect(() => {
    const playback = playbackRef.current;

    if (!playback) {
      return;
    }

    const { ticker, scheduler } = playback;

    scheduler.push(text.length - playback.received);

    playback.received = text.length;

    if (active && !reducedMotion && playback.visible < playback.received && !ticker.running) {
      scheduler.resume(ticker.start());
    }
  }, [active, cycle, reducedMotion, source, text, Scheduler, Ticker]);

  return reducedMotion ? source.length : Math.min(cursor, text.length);
};
