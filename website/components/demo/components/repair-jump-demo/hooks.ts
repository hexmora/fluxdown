import type { RefObject, UIEvent } from 'react';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { JumpStream, RestartOptions } from './type';

import {
  delivered,
  inputOffsets,
  scoreTrajectory,
  semanticSnapshot,
  type TrajectoryFrame,
} from '../../../../benchmark/repair/semantic.mjs';
import { EMPTY_REPORT } from './consts';
import { SCENARIOS } from './scenarios';

export const useJumpStream = () => {
  const preview = useRef<HTMLDivElement>(null);
  const frames = useRef<TrajectoryFrame[]>([]);
  const captured = useRef('');
  const [stream, setStream] = useState<JumpStream>({
    scenario: 0,
    repair: false,
    run: 0,
    cursor: 0,
    advanceTo: 0,
    playing: false,
    complete: false,
  });
  const [report, setReport] = useState(EMPTY_REPORT);
  const [ready, setReady] = useState('');
  const [speed, setSpeed] = useState(12);
  const scenario = SCENARIOS[stream.scenario];
  const offsets = useMemo(() => inputOffsets(scenario.test.source), [scenario]);
  const text = scenario.test.source.slice(0, offsets[stream.cursor - 1] ?? 0);
  const frameKey = `${stream.run}:${stream.cursor}:${stream.complete}`;

  useEffect(() => {
    if (stream.cursor === 0) {
      setReady(frameKey);
      return;
    }

    const container = preview.current;

    if (!container || captured.current === frameKey) {
      return;
    }

    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;

    const sample = () => {
      if (cancelled || captured.current === frameKey) {
        return;
      }

      observer.disconnect();
      captured.current = frameKey;
      frames.current.push({
        offset: text.length,
        done: stream.complete,
        expected: delivered(scenario.test, text.length),
        snapshot: semanticSnapshot(container, { computedVisibility: false }),
      });

      const result = scoreTrajectory(scenario.test, frames.current);

      setReport({
        frames: stream.cursor,
        jumpFrames: result.summary.transitionFrames,
        events: result.events.filter((event) => !event.done),
      });
      setReady(frameKey);
    };
    const schedule = () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(sample);
      });
    };
    const observer = new MutationObserver(schedule);

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });
    schedule();

    return () => {
      cancelled = true;
      observer.disconnect();
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [frameKey, scenario, stream.complete, stream.cursor, text]);

  useEffect(() => {
    if (!stream.playing || stream.complete || ready !== frameKey) {
      return;
    }

    const timer = window.setTimeout(
      () => {
        setStream((current) =>
          current.cursor === offsets.length
            ? { ...current, playing: false, complete: true }
            : { ...current, cursor: current.cursor + 1 },
        );
      },
      stream.cursor < stream.advanceTo ? 0 : 1000 / speed,
    );

    return () => window.clearTimeout(timer);
  }, [
    frameKey,
    offsets.length,
    ready,
    speed,
    stream.advanceTo,
    stream.complete,
    stream.cursor,
    stream.playing,
  ]);

  const restart = (options: RestartOptions = {}) => {
    frames.current = [];
    captured.current = '';
    setReport(EMPTY_REPORT);
    setStream((current) => ({
      ...current,
      ...options,
      run: current.run + 1,
      cursor: 0,
      advanceTo: 0,
      complete: false,
      playing: true,
    }));
  };

  return {
    preview,
    stream,
    report,
    text,
    length: offsets.length,
    ready: ready === frameKey,
    speed,
    setSpeed,
    restart,
    toggle: () =>
      setStream((current) => ({
        ...current,
        playing: !current.playing,
        advanceTo: current.cursor,
      })),
    advance: () =>
      setStream((current) => ({
        ...current,
        playing: true,
        advanceTo: Math.min(Math.max(current.cursor, current.advanceTo) + 16, offsets.length),
      })),
    step: () =>
      setStream((current) =>
        current.cursor === offsets.length
          ? { ...current, playing: false, complete: true }
          : { ...current, playing: false, cursor: current.cursor + 1 },
      ),
  };
};

export const useFollowScroll = (
  target: RefObject<HTMLDivElement | null>,
  count: number,
  run: number,
) => {
  const following = useRef(true);
  const previousTop = useRef(0);

  useEffect(() => {
    following.current = true;
    previousTop.current = 0;
  }, [run]);

  useEffect(() => {
    if (following.current && target.current) {
      target.current.scrollTo({ top: target.current.scrollHeight, behavior: 'smooth' });
    }
  }, [count, run, target]);

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const atBottom = element.scrollHeight - element.scrollTop - element.clientHeight <= 12;

    if (atBottom) {
      following.current = true;
    } else if (element.scrollTop < previousTop.current) {
      following.current = false;
      element.scrollTo({ top: element.scrollTop, behavior: 'auto' });
    }

    previousTop.current = element.scrollTop;
  };

  return onScroll;
};
