import { StepSmoothScheduler, TargetScheduler } from './utils';

describe('BaseSmoothScheduler', () => {
  test('provides defaults and retains an explicitly supplied tuple', () => {
    const tuple = [3, 4];

    expect(new TargetScheduler().tuple).toEqual([1, 2]);

    expect(new TargetScheduler(tuple).tuple).toBe(tuple);
  });

  test('rejects a tuple of the wrong length when read', () => {
    const scheduler = new TargetScheduler([3]);

    expect(() => scheduler.tuple).toThrow();
  });

  test('resumes timing from the previous target before accepting new content', () => {
    const scheduler = new StepSmoothScheduler();

    scheduler.start(0, 3);

    scheduler.push(2);

    expect([16, 32].map((timestamp) => scheduler.tick(timestamp))).toEqual([1, 1]);

    scheduler.resume(10_000);

    expect(scheduler.startCalls).toEqual([
      { timestamp: 0, index: 3 },
      { timestamp: 10_000, index: 5 },
    ]);

    expect(scheduler.tick(10_016)).toBe(0);

    scheduler.push(2);

    expect([10_032, 10_048, 10_064].map((timestamp) => scheduler.tick(timestamp))).toEqual([
      1, 1, 0,
    ]);
  });

  test('adds pushed lengths and resets to the requested target', () => {
    const scheduler = new TargetScheduler();

    scheduler.push(5);

    scheduler.push(2);

    expect(scheduler.tick(0)).toBe(7);

    scheduler.reset(3);

    expect(scheduler.tick(0)).toBe(3);

    scheduler.reset();

    expect(scheduler.tick(0)).toBe(0);
  });
});
