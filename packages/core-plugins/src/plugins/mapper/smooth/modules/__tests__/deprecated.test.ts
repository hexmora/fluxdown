import {
  BaseSmoothDriver,
  BaseSmoothInterpolator,
  BaseSmoothScheduler,
  BaseSmoothTicker,
  IntervalSmoothDriver,
  IntervalSmoothTicker,
  RafSmoothDriver,
  RafSmoothTicker,
  SpringSmoothInterpolator,
  SpringSmoothScheduler,
} from '..';

test('keeps the pre-rename names as aliases of the driver and interpolator classes', () => {
  expect(BaseSmoothTicker).toBe(BaseSmoothDriver);

  expect(RafSmoothTicker).toBe(RafSmoothDriver);

  expect(IntervalSmoothTicker).toBe(IntervalSmoothDriver);

  expect(BaseSmoothScheduler).toBe(BaseSmoothInterpolator);

  expect(SpringSmoothScheduler).toBe(SpringSmoothInterpolator);

  expect(new SpringSmoothScheduler()).toBeInstanceOf(SpringSmoothInterpolator);
});
