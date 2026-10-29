import type { BandInputs } from '../type';

import { getBands } from '../utils';

const INPUTS: BandInputs = {
  width: 80,
  maskWidth: 80,
  maskEnd: 110.5,
  padding: 4,
  pixelRatio: 3,
};

test.each([1, 3, 2.625])('bounds gradient quantization on a pixel ratio of %s', (pixelRatio) => {
  const bands = getBands({ ...INPUTS, pixelRatio });

  const step = Math.max(1, Math.round(2 * pixelRatio)) / pixelRatio;

  for (const band of bands) {
    expect(band.left * pixelRatio).toBeCloseTo(Math.round(band.left * pixelRatio));

    expect((band.left + band.width) * pixelRatio).toBeCloseTo(
      Math.round((band.left + band.width) * pixelRatio),
    );

    for (const fraction of [0.001, 0.5, 0.999]) {
      const x = band.left + band.width * fraction;

      const expected = Math.max(0, Math.min(1, (INPUTS.maskEnd - x) / INPUTS.maskWidth));

      expect(Math.abs(band.opacity - expected)).toBeLessThanOrEqual(
        step / (2 * INPUTS.maskWidth) + 1e-12,
      );
    }
  }
});

test('keeps fixed band identities while the gradient moves within the word', () => {
  const before = getBands({ ...INPUTS, maskEnd: 110.1 });

  const after = getBands({ ...INPUTS, maskEnd: 111.7 });

  expect(after.map(({ key, left }) => ({ key, left }))).toEqual(
    before.map(({ key, left }) => ({ key, left })),
  );

  expect(after[0].key).toBe('prefix');

  expect(after[1].key).toBe('band-15');

  expect(after[1].opacity).not.toBe(before[1].opacity);
});

test('keeps the opaque prefix in one clip and renders only the intersecting gradient', () => {
  const bands = getBands({ ...INPUTS, maskEnd: 110 });

  expect(bands[0]).toEqual({ key: 'prefix', left: -4, width: 34, opacity: 1 });

  expect(bands[1].left).toBe(30);

  expect(bands.at(-1)!.left + bands.at(-1)!.width).toBe(84);

  expect(bands.every(({ width }) => width > 0)).toBe(true);

  expect(getBands({ ...INPUTS, maskWidth: 0 })).toEqual([]);

  expect(getBands({ ...INPUTS, width: 0 })).toEqual([]);
});

test('preserves native italic overhang without changing the text advance', () => {
  const bands = getBands({ ...INPUTS, maskEnd: 80 });

  expect(bands[0].left).toBe(-4);

  expect(bands.at(-1)!.left + bands.at(-1)!.width).toBe(80);
});
