import { getNow, IntervalSmoothDriver, RafSmoothDriver } from '..';
import { restoreGlobals, stubGlobal } from '../../../../../../../../scripts/testing/globals';
import { FakeSmoothDriver, mockAnimationFrames } from './utils';

afterEach(() => {
  jest.useRealTimers();

  jest.restoreAllMocks();

  restoreGlobals();
});

describe('driver timestamps', () => {
  test('uses performance.now without consulting the wall clock', () => {
    const now = jest.fn(() => 42);

    stubGlobal('performance', { now });

    const wallClock = jest.spyOn(Date, 'now').mockReturnValue(-1);

    expect(getNow()).toBe(42);

    expect(now).toHaveBeenCalledTimes(1);

    expect(wallClock).not.toHaveBeenCalled();
  });
});

describe('RafSmoothDriver', () => {
  test('emits frame timestamps and cancels the pending frame on stop', () => {
    const frames = mockAnimationFrames();

    const driver = new RafSmoothDriver();

    const next = jest.fn();

    driver.value.subscribe(next);

    expect(driver.running).toBe(false);

    expect(driver.start()).toEqual(expect.any(Number));

    expect(driver.running).toBe(true);

    expect(frames.request).toHaveBeenCalledTimes(1);

    frames.frame(1)(10);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(10);

    expect(frames.request).toHaveBeenCalledTimes(2);

    const pending = frames.frame(2);

    driver.stop();

    expect(driver.running).toBe(false);

    expect(frames.cancel).toHaveBeenCalledTimes(1);
    expect(frames.cancel).toHaveBeenCalledWith(2);

    pending(20);

    expect(next).toHaveBeenCalledTimes(1);

    expect(frames.request).toHaveBeenCalledTimes(2);

    driver.destroy();
  });

  test('ignores an old canceled callback after restart', () => {
    const frames = mockAnimationFrames();

    const driver = new RafSmoothDriver();

    const next = jest.fn();

    driver.value.subscribe(next);

    driver.start();

    const stale = frames.frame(1);

    driver.stop();

    driver.start();

    stale(10);

    expect(next).not.toHaveBeenCalled();

    expect(frames.request).toHaveBeenCalledTimes(2);

    frames.frame(2)(20);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(20);

    expect(frames.request).toHaveBeenCalledTimes(3);

    driver.destroy();
  });

  test('does not schedule another frame when an observer stops the driver', () => {
    const frames = mockAnimationFrames();

    const driver = new RafSmoothDriver();

    driver.value.subscribe(() => driver.stop());

    driver.start();

    frames.frame(1)(10);

    expect(driver.running).toBe(false);

    expect(frames.request).toHaveBeenCalledTimes(1);

    driver.destroy();
  });

  test('starts with the same monotonic clock used by animation frames', () => {
    mockAnimationFrames();

    const now = jest.spyOn(performance, 'now').mockReturnValue(42);

    const wallClock = jest.spyOn(Date, 'now').mockReturnValue(-1);

    const driver = new RafSmoothDriver();

    expect(driver.start()).toBe(42);

    expect(now).toHaveBeenCalledTimes(1);

    expect(wallClock).not.toHaveBeenCalled();

    driver.destroy();
  });
});

describe('IntervalSmoothDriver', () => {
  test('emits on the configured interval and stops future emissions', () => {
    jest.useFakeTimers();

    const driver = new IntervalSmoothDriver(20);

    const next = jest.fn();

    driver.value.subscribe(next);

    expect(driver.start()).toEqual(expect.any(Number));

    expect(driver.running).toBe(true);

    jest.advanceTimersByTime(45);

    expect(next).toHaveBeenCalledTimes(2);

    expect(next).toHaveBeenNthCalledWith(1, expect.any(Number));

    driver.stop();

    jest.advanceTimersByTime(60);

    expect(driver.running).toBe(false);

    expect(next).toHaveBeenCalledTimes(2);

    expect(jest.getTimerCount()).toBe(0);

    driver.destroy();
  });

  test('defaults to approximately sixty frames per second', () => {
    jest.useFakeTimers();

    const driver = new IntervalSmoothDriver();

    const next = jest.fn();

    driver.value.subscribe(next);

    driver.start();

    jest.advanceTimersByTime(50);

    expect(next).toHaveBeenCalledTimes(3);

    driver.destroy();
  });

  test('can restart after stop without duplicating the interval', () => {
    jest.useFakeTimers();

    const driver = new IntervalSmoothDriver(10);

    const next = jest.fn();

    driver.value.subscribe(next);

    driver.start();

    jest.advanceTimersByTime(10);

    driver.stop();

    driver.start();

    jest.advanceTimersByTime(10);

    expect(next).toHaveBeenCalledTimes(2);

    expect(jest.getTimerCount()).toBe(1);

    driver.destroy();
  });
});

describe.each([RafSmoothDriver, IntervalSmoothDriver])('$name lifecycle', (Driver) => {
  test('rejects repeated starts and stops', () => {
    jest.useFakeTimers();

    mockAnimationFrames();

    const driver = new Driver();

    expect(() => driver.stop()).toThrow('Cannot stop a stopping driver');

    driver.start();

    expect(() => driver.start()).toThrow('Cannot start a running driver');

    driver.stop();

    expect(() => driver.stop()).toThrow('Cannot stop a stopping driver');

    driver.destroy();
  });

  test.each([false, true])('destroy completes once when running=%s', (running) => {
    jest.useFakeTimers();

    const frames = mockAnimationFrames();

    const driver = new Driver();

    const complete = jest.fn();

    const subscription = driver.value.subscribe({ complete });

    if (running) {
      driver.start();
    }

    driver.destroy();

    driver.destroy();

    expect(driver.running).toBe(false);

    expect(subscription.closed).toBe(true);

    expect(complete).toHaveBeenCalledTimes(1);

    expect(jest.getTimerCount()).toBe(0);

    expect(frames.cancel).toHaveBeenCalledTimes(running && Driver === RafSmoothDriver ? 1 : 0);
  });
});

describe('FakeSmoothDriver test utility', () => {
  test('supports repeated timestamps and rejects backward or inactive ticks', () => {
    const driver = new FakeSmoothDriver(10);

    const next = jest.fn();

    driver.value.subscribe(next);

    expect(() => driver.tick(11)).toThrow('Cannot tick a stopping driver');

    expect(driver.start()).toBe(10);

    expect(() => driver.start()).toThrow('Cannot start a running driver');

    driver.tick(12);

    driver.tick(12);

    expect(() => driver.tick(11)).toThrow('Cannot tick previous timestamp');

    expect(next.mock.calls).toEqual([[12], [12]]);

    driver.stop();

    expect(() => driver.stop()).toThrow('Cannot stop a stopping driver');

    expect(() => driver.tick(13)).toThrow('Cannot tick a stopping driver');

    driver.advanceTo(20);

    expect(driver.start()).toBe(20);

    driver.destroy();
  });
});
