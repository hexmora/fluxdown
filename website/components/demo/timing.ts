import type { DemoTiming } from './type';

export const createDemoFrames = (source: string, timing: DemoTiming) => {
  const segments = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(source);
  const ends = Array.from(segments, ({ index, segment }) => index + segment.length);
  const count = Math.min(60, ends.length);
  const weights = Array.from(
    { length: count },
    (_, index) => timing.chunks[index % timing.chunks.length],
  );
  const delays = Array.from(
    { length: count },
    (_, index) => timing.delays[index % timing.delays.length],
  );
  const weightTotal = weights.reduce((total, weight) => total + weight, 0);
  const delayTotal = delays.reduce((total, delay) => total + delay, 0);
  const duration = Math.max(18_000, timing.duration ?? 18_000);
  let accumulated = 0;
  let previousEnd = 0;
  let elapsed = 0;

  return weights.map((weight, index) => {
    accumulated += weight;
    const end = Math.min(
      ends.length - (count - index - 1),
      Math.max(previousEnd + 1, Math.round((accumulated / weightTotal) * ends.length)),
    );
    previousEnd = end;
    const delay =
      index === count - 1
        ? duration - elapsed
        : Math.round((delays[index] / delayTotal) * duration);
    elapsed += delay;

    return { end: ends[end - 1], delay };
  });
};
