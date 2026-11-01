import { StepSmoothInterpolator, TargetInterpolator } from './utils';

describe('BaseSmoothInterpolator', () => {
  test('provides defaults and retains an explicitly supplied tuple', () => {
    const tuple = [3, 4];

    expect(new TargetInterpolator().tuple).toEqual([1, 2]);

    expect(new TargetInterpolator(tuple).tuple).toBe(tuple);
  });

  test('rejects a tuple of the wrong length when read', () => {
    const interpolator = new TargetInterpolator([3]);

    expect(() => interpolator.tuple).toThrow();
  });

  test('resumes timing from the previous target before accepting new content', () => {
    const interpolator = new StepSmoothInterpolator();

    interpolator.start(0, 3);

    interpolator.push(2);

    expect([16, 32].map((timestamp) => interpolator.tick(timestamp))).toEqual([1, 1]);

    interpolator.resume(10_000);

    expect(interpolator.startCalls).toEqual([
      { timestamp: 0, index: 3 },
      { timestamp: 10_000, index: 5 },
    ]);

    expect(interpolator.tick(10_016)).toBe(0);

    interpolator.push(2);

    expect([10_032, 10_048, 10_064].map((timestamp) => interpolator.tick(timestamp))).toEqual([
      1, 1, 0,
    ]);
  });

  test('adds pushed lengths and resets to the requested target', () => {
    const interpolator = new TargetInterpolator();

    interpolator.push(5);

    interpolator.push(2);

    expect(interpolator.tick(0)).toBe(7);

    interpolator.reset(3);

    expect(interpolator.tick(0)).toBe(3);

    interpolator.reset();

    expect(interpolator.tick(0)).toBe(0);
  });
});
