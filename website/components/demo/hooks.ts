import { useEffect, useMemo, useRef, useState } from 'react';

import type { DemoPlayback, DemoTiming } from './type';

import { createDemoFrames } from './timing';

const DEFAULT_TIMING: DemoTiming = {
  chunks: [12, 26, 8, 34, 16, 22],
  delays: [520, 760, 340, 980, 460, 680],
};

export const useDemoStream = (source: string, timing: DemoTiming = DEFAULT_TIMING) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const frames = useMemo(() => createDemoFrames(source, timing), [source, timing]);

  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  const [visible, setVisible] = useState(false);

  const [foreground, setForeground] = useState(true);

  const [stream, setStream] = useState<DemoPlayback>({
    source,
    cursor: 0,
    step: 0,
    playing: true,
    cycle: 0,
  });

  const cursor = reducedMotion ? source.length : stream.source === source ? stream.cursor : 0;

  const complete = cursor >= source.length;

  const active = reducedMotion === false && visible && foreground && stream.playing;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => setReducedMotion(media.matches);

    update();

    media.addEventListener('change', update);

    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const update = () => setForeground(document.visibilityState === 'visible');

    update();

    document.addEventListener('visibilitychange', update);

    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.2,
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setStream((current) => ({
      source,
      cursor: 0,
      step: 0,
      playing: true,
      cycle: current.cycle + 1,
    }));
  }, [source]);

  useEffect(() => {
    const frame = frames[stream.step];

    if (!active || complete || stream.source !== source || !frame) {
      return;
    }

    const timer = window.setTimeout(() => {
      setStream((current) => ({
        ...current,
        cursor: frame.end,
        step: current.step + 1,
      }));
    }, frame.delay);

    return () => window.clearTimeout(timer);
  }, [active, complete, frames, source, stream]);

  return {
    containerRef,
    reducedMotion,
    active,
    complete,
    playing: active && !complete,
    cycle: stream.cycle,
    text: source.slice(0, cursor),
    toggle: () => setStream((current) => ({ ...current, playing: !current.playing })),
    replay: () =>
      setStream((current) => ({
        source,
        cursor: 0,
        step: 0,
        playing: true,
        cycle: current.cycle + 1,
      })),
  };
};
