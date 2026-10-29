import type { ScaleTextProps } from '../type';

import { getScaleFrame } from '../utils';

const PROPS: ScaleTextProps = {
  text: 'S',
  textStyle: { fontSize: '16px' },
  start: 1000,
  duration: 200,
  from: 0,
  blur: 0.08,
};

test.each([0, 0.6, 1])('retains the React entrance curves from scale %s', (from) => {
  const frame = getScaleFrame({ ...PROPS, from }, 0.5);

  expect(frame.scale).toBe(from + (1 - from) * 0.875);

  expect(frame.opacity).toBe(0.765625);

  const radius = PROPS.blur * 16 * Math.cos(Math.PI / 4);

  expect(Math.abs((frame.blur! * frame.scale) / 2 - radius)).toBeLessThanOrEqual(frame.scale / 4);
});

test('skips only alpha below one output color level before allocating a shadow', () => {
  for (const progress of [0, 0.005, 0.01, 0.02, 0.025, 0.03, 0.1]) {
    const frame = getScaleFrame(PROPS, progress);

    if (frame.blur === null) {
      expect(frame.opacity).toBeLessThanOrEqual(1 / 255);
    } else {
      expect(frame.opacity).toBeGreaterThan(1 / 255);

      expect(Number.isInteger(frame.blur)).toBe(true);
    }
  }
});

test.each([0, 0.08, 0.5])('settles custom blur %s without changing scale or opacity', (blur) => {
  const frame = getScaleFrame({ ...PROPS, blur }, 1);

  expect(frame).toEqual({ scale: 1, opacity: 1, blur: 0 });

  expect(getScaleFrame({ ...PROPS, blur }, 0.25).blur).toBeGreaterThanOrEqual(0);
});

test('applies inherited opacity once to the shadow layer', () => {
  const frame = getScaleFrame({ ...PROPS, textStyle: { fontSize: '16px', opacity: 0.5 } }, 0.5);

  expect(frame.opacity).toBe(0.3828125);
});

test('interpolates the same eleven opacity keyframes as the React stylesheet', () => {
  expect(getScaleFrame(PROPS, 0.05).opacity).toBeCloseTo(0.0367205);

  expect(getScaleFrame(PROPS, 0.15).opacity).toBeCloseTo((0.073441 + 0.238144) / 2);

  expect(getScaleFrame(PROPS, 0.25).opacity).toBeCloseTo((0.238144 + 0.431649) / 2);

  expect(getScaleFrame(PROPS, 0.95).opacity).toBeCloseTo((0.998001 + 1) / 2);
});
