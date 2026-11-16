import { once as onceCallback } from 'lodash-es';
import { once, ReactiveState, useClearable, useMap } from 'stative';

import type { DriverFramesInputs, SmoothTick } from './type';

export * from './type';

export const DriverFrames = /*#__PURE__*/ once(function DriverFrames({
  Driver,
}: DriverFramesInputs) {
  const driver = new Driver();

  const handleDestroy = useClearable(onceCallback(() => driver.destroy()));

  const timestamps = useClearable(
    new ReactiveState({
      initial: driver.start(),

      emitter: (observer) => {
        const subscription = driver.value.subscribe(observer);

        subscription.add(handleDestroy);

        return subscription;
      },
    }),
  );

  return useMap(timestamps, (timestamp): SmoothTick => ({ driver, timestamp }));
});
