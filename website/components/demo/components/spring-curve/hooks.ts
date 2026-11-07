import { useEffect, useRef, useState } from 'react';

import { DURATION } from './trace';

export const useCurvePlayback = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let elapsed = 0;
    let previous: number | undefined;
    let frame: number | undefined;
    setTime(0);

    const stop = () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
      previous = undefined;
    };

    const tick = (timestamp: number) => {
      if (previous !== undefined) elapsed += timestamp - previous;
      previous = timestamp;
      elapsed = Math.min(elapsed, DURATION);
      setTime(elapsed);
      frame = elapsed < DURATION ? requestAnimationFrame(tick) : undefined;
    };

    const update = () => {
      stop();
      if (media.matches) {
        elapsed = DURATION;
        setTime(DURATION);
        return;
      }
      if (visible && document.visibilityState === 'visible' && elapsed < DURATION) {
        frame = requestAnimationFrame(tick);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { threshold: 0.2 },
    );
    observer.observe(container);
    media.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    update();

    return () => {
      stop();
      observer.disconnect();
      media.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [cycle]);

  return { containerRef, time, replay: () => setCycle((value) => value + 1) };
};
