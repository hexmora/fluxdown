import type { MaskFrameInputs } from '../type';

import { getBandOpacity, getMaskFrame } from '../utils';

const INPUTS: MaskFrameInputs = {
  width: 80,
  height: 24,
  maskWidth: 32,
  maskEnd: 72.5,
  padding: 4.6,
  pixelRatio: 3,
};

test.each([1, 3, 2.625])(
  'keeps opaque and active clips adjacent on a pixel ratio of %s',
  (pixelRatio) => {
    const frame = getMaskFrame({ ...INPUTS, pixelRatio });

    const right = Math.ceil((INPUTS.width + INPUTS.padding) * pixelRatio) / pixelRatio;

    expect(frame.left).toBeLessThanOrEqual(-INPUTS.padding);

    expect(frame.left + frame.prefixWidth).toBe(frame.start);

    expect(frame.start + frame.activeWidth).toBeLessThanOrEqual(right);

    for (const value of [frame.left, frame.start, frame.step, frame.activeWidth]) {
      expect(value * pixelRatio).toBeCloseTo(Math.round(value * pixelRatio));
    }

    for (let index = 1; index <= Math.ceil(frame.activeWidth / frame.step); index += 1) {
      const center = frame.start + (index - 0.5) * frame.step;

      const expected = Math.max(0, Math.min(1, (INPUTS.maskEnd - center) / INPUTS.maskWidth));

      expect(getBandOpacity(frame, index)).toBeCloseTo(expected);
    }
  },
);

test('clips masks outside the word and covers the complete italic word when opaque', () => {
  const inputs = { ...INPUTS, padding: 4, pixelRatio: 1 };

  const before = getMaskFrame({ ...inputs, maskEnd: -10 });

  const after = getMaskFrame({ ...inputs, maskEnd: 200 });

  const opaque = getMaskFrame({ ...inputs, maskWidth: 0, maskEnd: 0 });

  expect(before.prefixWidth).toBe(0);

  expect(before.activeWidth).toBe(0);

  expect(after).toMatchObject({ left: -4, prefixWidth: 88, activeWidth: 0 });

  expect(opaque).toMatchObject({ left: -4, prefixWidth: 88, activeWidth: 0 });

  expect(opaque.left + opaque.prefixWidth).toBe(84);

  expect(getBandOpacity(opaque, 1)).toBe(1);
});

test('samples a linear gradient once at each band center and clamps unused pool bands', () => {
  const frame = getMaskFrame({
    ...INPUTS,
    width: 32,
    maskWidth: 16,
    maskEnd: 32,
    padding: 0,
    pixelRatio: 1,
  });

  expect(frame.prefixWidth).toBe(16);

  expect(frame.activeWidth).toBe(16);

  expect(getBandOpacity(frame, 1)).toBe(15.5 / 16);

  expect(getBandOpacity(frame, 16)).toBe(0.5 / 16);

  expect(getBandOpacity(frame, 17)).toBe(0);
});
