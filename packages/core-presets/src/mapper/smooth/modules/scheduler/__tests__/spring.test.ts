import { getSpringMotion, SpringSmoothScheduler } from '..';

const DEFAULT_SPRING = { frequency: 5, dampingRatio: 1 };

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const tickAll = (scheduler: SpringSmoothScheduler, timestamps: number[]) =>
  timestamps.map((timestamp) => scheduler.tick(timestamp));

const frames = (count: number, interval = 16, offset = 0) =>
  Array.from({ length: count }, (_, index) => offset + (index + 1) * interval);

describe('SpringSmoothScheduler', () => {
  test('exposes the default spring and constructor name', () => {
    const scheduler = new SpringSmoothScheduler();

    expect(SpringSmoothScheduler.name).toBe('spring');

    expect(scheduler.tuple).toEqual([5, 1]);

    expect(scheduler.spring).toEqual(DEFAULT_SPRING);
  });

  test('honors a supplied tuple', () => {
    const tuple = [20, 0.5];

    const scheduler = new SpringSmoothScheduler(tuple);

    expect(scheduler.tuple).toBe(tuple);

    expect(scheduler.spring).toEqual({ frequency: 20, dampingRatio: 0.5 });
  });

  test.each([
    [0, 1],
    [-15, 1.3],
    [15, 0],
    [15, Number.NaN],
    [Infinity, 1],
  ])('rejects the spring [%d, %d] when sampled', (frequency, dampingRatio) => {
    const scheduler = new SpringSmoothScheduler([frequency, dampingRatio]);

    scheduler.start(0);

    scheduler.push(10);

    expect(() => scheduler.tick(16)).toThrow('Expected a positive spring frequency');
  });

  test('requires start before ticking or resuming', () => {
    expect(() => new SpringSmoothScheduler().tick(16)).toThrow('Cannot tick without call start');

    expect(() => new SpringSmoothScheduler().resume(16)).toThrow('Cannot tick without call start');
  });

  test('reports the rounded closed-form position on every frame', () => {
    const scheduler = new SpringSmoothScheduler();

    scheduler.start(0, 5);

    scheduler.push(100);

    let cursor = 5;

    for (const timestamp of frames(60)) {
      cursor += scheduler.tick(timestamp);

      const { displacement } = getSpringMotion(
        DEFAULT_SPRING,
        { displacement: -100, velocity: 0 },
        timestamp / 1000,
      );

      expect(cursor).toBe(Math.round(105 + displacement));
    }
  });

  test('does not depend on how elapsed time is split into frames', () => {
    const timelines = [
      frames(60, 16),
      frames(120, 8),
      frames(15, 64),
      [3, 7.5, 11, 40, 41, 41.5, 300, 301, 960],
      [960],
    ];

    const totals = timelines.map((timestamps) => {
      const scheduler = new SpringSmoothScheduler();

      scheduler.start(0);

      scheduler.push(100);

      return sum(tickAll(scheduler, timestamps));
    });

    expect(new Set(totals).size).toBe(1);
  });

  test('keeps the trajectory unchanged when the target does not move', () => {
    const plain = new SpringSmoothScheduler();

    const retargeted = new SpringSmoothScheduler();

    for (const scheduler of [plain, retargeted]) {
      scheduler.start(0);

      scheduler.push(50);
    }

    const expected = tickAll(plain, frames(40));

    const actual = frames(40).map((timestamp) => {
      retargeted.push(0);

      return retargeted.tick(timestamp);
    });

    expect(actual).toEqual(expected);
  });

  test.each([
    { name: 'overdamped', tuple: [15, 1.3] },
    { name: 'critically damped', tuple: [15, 1] },
    { name: 'underdamped', tuple: [15, 0.2] },
  ])('drains staggered chunks without rollback or overshoot when $name', ({ tuple }) => {
    const arrivals = new Map([
      [1, 8],
      [3, 3],
      [7, 25],
      [9, 1],
      [16, 60],
      [29, 12],
      [31, 100],
    ]);

    const scheduler = new SpringSmoothScheduler(tuple);

    let cursor = 0;

    let available = 0;

    scheduler.start(0);

    for (let frame = 1; frame <= 500; frame += 1) {
      const length = arrivals.get(frame) ?? 0;

      scheduler.push(length);

      available += length;

      const distance = scheduler.tick(frame * 16);

      cursor += distance;

      expect(Number.isInteger(distance)).toBe(true);

      expect(distance).toBeGreaterThanOrEqual(0);

      expect(cursor).toBeLessThanOrEqual(available);
    }

    expect(cursor).toBe(209);

    expect(scheduler.idle).toBe(true);
  });

  test('accelerates from rest and settles without overshooting', () => {
    const scheduler = new SpringSmoothScheduler();

    scheduler.start(0);

    scheduler.push(100);

    const distances = tickAll(scheduler, frames(130));

    expect(distances.slice(0, 4)).toEqual([0, 1, 1, 2]);

    expect(sum(distances)).toBe(100);

    expect(scheduler.idle).toBe(true);
  });

  test('is busy until the visible cursor reaches the target', () => {
    const scheduler = new SpringSmoothScheduler();

    scheduler.start(0);

    expect(scheduler.idle).toBe(true);

    scheduler.push(3);

    expect(scheduler.idle).toBe(false);

    tickAll(scheduler, frames(60));

    expect(scheduler.idle).toBe(true);
  });

  test('evaluates a pause as if frames had kept arriving', () => {
    const paused = new SpringSmoothScheduler();

    const continuous = new SpringSmoothScheduler();

    for (const scheduler of [paused, continuous]) {
      scheduler.start(0);

      scheduler.push(2);
    }

    tickAll(paused, frames(40));

    expect(paused.idle).toBe(true);

    tickAll(continuous, frames(45));

    paused.resume(720);

    for (const scheduler of [paused, continuous]) {
      scheduler.push(40);
    }

    expect(tickAll(paused, frames(20, 16, 720))).toEqual(tickAll(continuous, frames(20, 16, 720)));
  });

  test('keeps momentum when resetting progress', () => {
    const reset = new SpringSmoothScheduler();

    const restarted = new SpringSmoothScheduler();

    for (const scheduler of [reset, restarted]) {
      scheduler.start(0);

      scheduler.push(100);

      tickAll(scheduler, frames(3));
    }

    reset.reset(10);

    reset.push(90);

    restarted.start(48, 10);

    restarted.push(90);

    const [resetDistance = 0] = tickAll(reset, [64]);

    const [restartedDistance = 0] = tickAll(restarted, [64]);

    expect(resetDistance).toBeGreaterThan(restartedDistance);
  });

  test('restarts at rest from the requested index', () => {
    const scheduler = new SpringSmoothScheduler();

    scheduler.start(0);

    scheduler.push(100);

    tickAll(scheduler, frames(10));

    scheduler.start(1000, 4);

    scheduler.push(100);

    const fresh = new SpringSmoothScheduler();

    fresh.start(0, 4);

    fresh.push(100);

    expect(tickAll(scheduler, frames(20, 16, 1000))).toEqual(tickAll(fresh, frames(20)));
  });

  test('ignores repeated or backward timestamps without shifting forward timing', () => {
    const scheduler = new SpringSmoothScheduler();

    const reference = new SpringSmoothScheduler();

    for (const instance of [scheduler, reference]) {
      instance.start(10);

      instance.push(100);
    }

    expect(tickAll(scheduler, [42, 42, 30, 58])).toEqual([
      ...tickAll(reference, [42]),
      0,
      0,
      ...tickAll(reference, [58]),
    ]);
  });

  test('reports the closed-form motion without changing the trajectory', () => {
    const inspected = new SpringSmoothScheduler();

    const reference = new SpringSmoothScheduler();

    for (const scheduler of [inspected, reference]) {
      scheduler.start(0, 10);

      scheduler.push(40);
    }

    expect(inspected.getMotion()).toEqual({ position: 10, velocity: 0, target: 50, cursor: 10 });

    const cursor = 10 + sum(tickAll(inspected, frames(5)));

    const { displacement, velocity } = getSpringMotion(
      DEFAULT_SPRING,
      { displacement: -40, velocity: 0 },
      0.08,
    );

    const motion = inspected.getMotion();

    expect(motion.position).toBeCloseTo(50 + displacement, 10);

    expect(motion.velocity).toBeCloseTo(velocity, 10);

    expect(motion).toMatchObject({ target: 50, cursor });

    expect(inspected.getMotion(200).position).toBeGreaterThan(motion.position);

    tickAll(reference, frames(5));

    expect(tickAll(inspected, frames(10, 16, 80))).toEqual(tickAll(reference, frames(10, 16, 80)));
  });
});
