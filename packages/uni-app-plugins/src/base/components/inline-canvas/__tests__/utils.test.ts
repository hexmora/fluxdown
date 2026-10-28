import type { InlineCanvasProps } from '../type';

import { drawText, getProgress } from '../utils';

const createContext = () => {
  const samples: { alpha: number; operation: string; x: number; y: number }[] = [];

  const context = {
    canvas: { width: 100, height: 40 },
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    clearRect: vi.fn(),
    setTransform: vi.fn(),
    measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
    fillText(_text: string, x: number, y: number) {
      samples.push({
        alpha: context.globalAlpha,
        operation: context.globalCompositeOperation,
        x,
        y,
      });
    },
  };

  return { context: context as unknown as CanvasRenderingContext2D, samples };
};

const PROPS: InlineCanvasProps = {
  text: 'tail',
  textStyle: { fontSize: '16px', lineHeight: '26.4px', color: '#202123' },
  start: 1000,
  duration: 400,
  from: 0.8,
  blur: 0.3,
};

describe('inline drawing', () => {
  test('retains event timing across remounts and clamps settled batches', () => {
    expect(getProgress(1000, 400, 1100)).toBe(0.25);

    expect(getProgress(1000, 400, 2000)).toBe(1);

    expect(getProgress(-1, 400, 0)).toBe(1);

    expect(getProgress(1000, 400, 900)).toBe(0);
  });

  test('preserves the opacity curve when accumulating blurred glyphs', () => {
    const { context, samples } = createContext();

    drawText(context, PROPS, { width: 32, height: 26.4 }, 16, 2, 0.5);

    expect(samples.every((sample) => sample.operation === 'lighter')).toBe(true);

    expect(samples.reduce((sum, sample) => sum + sample.alpha, 0)).toBeCloseTo(0.765625);

    expect(samples).toHaveLength(25);

    expect(context.setTransform).toHaveBeenLastCalledWith(1.95, 0, 0, 1.95, 64, 84.8);

    expect(context.setTransform).toHaveBeenCalledTimes(2);

    expect(context.measureText).not.toHaveBeenCalled();
  });

  test('keeps blur spread independent of glyph scale', () => {
    const spread = (from: number) => {
      const { context, samples } = createContext();

      drawText(context, { ...PROPS, from }, { width: 32, height: 26.4 }, 16, 1, 0.1);

      const scale = vi.mocked(context.setTransform).mock.calls.at(-1)![0] as number;

      const total = samples.reduce((sum, sample) => sum + sample.alpha, 0);

      const center = samples.reduce((sum, sample) => sum + sample.x * sample.alpha, 0) / total;

      return samples.reduce(
        (sum, sample) => sum + (Math.pow((sample.x - center) * scale, 2) * sample.alpha) / total,
        0,
      );
    };

    expect(spread(0)).toBeCloseTo(spread(0.8));
  });

  test('clears a zero-size glyph without dividing its blur offsets by zero', () => {
    const { context, samples } = createContext();

    drawText(context, { ...PROPS, from: 0 }, { width: 32, height: 26.4 }, 16, 1, 0);

    expect(context.clearRect).toHaveBeenCalled();

    expect(samples).toEqual([]);
  });

  test('masks the full active text rather than only the overlay width', () => {
    const { context } = createContext();

    drawText(
      context,
      { ...PROPS, maskText: 'tail next', trailingText: ' next', blur: 0 },
      { width: 32, height: 26.4 },
      1,
      1,
      1,
    );

    expect(context.createLinearGradient).toHaveBeenCalledWith(1, 0, 73, 0);
  });

  test('uses an alpha mask after drawing text on native canvases', () => {
    const { context, samples } = createContext();

    drawText(
      context,
      { ...PROPS, maskText: 'ext', trailingText: ' next', blur: 0 },
      { width: 32, height: 26.4 },
      1,
      1,
      1,
    );

    expect(samples).toEqual([{ alpha: 1, operation: 'source-over', x: -16, y: -13.2 }]);

    expect(context.globalCompositeOperation).toBe('destination-in');

    expect(context.createLinearGradient).toHaveBeenCalledWith(49, 0, 73, 0);

    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 34, 28.4);
  });
});
