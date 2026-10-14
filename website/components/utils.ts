import type { Frame, Stream } from './type';

// Long samples use 120 arrivals (30–54 seconds); short inputs use fewer frames.
export const createFrames = (source: string): Frame[] => {
  const segments = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(source);
  const ends = Array.from(segments, ({ index, segment }) => index + segment.length);
  const weights = Array.from({ length: Math.min(120, ends.length) }, () => 0.5 + Math.random());
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let accumulated = 0;

  return weights.map((weight, index) => {
    accumulated += weight;

    const count =
      index === weights.length - 1 ? ends.length : Math.floor((accumulated / total) * ends.length);

    return {
      end: ends[count - 1] ?? 0,
      delay: 250 + Math.floor(Math.random() * 201),
    };
  });
};

export const createStream = (source: string, reducedMotion: boolean): Stream => ({
  source,
  frames: reducedMotion ? [] : createFrames(source),
  cursor: reducedMotion ? source.length : 0,
  step: 0,
  playing: !reducedMotion && source.length > 0,
});
