import { sumBy } from 'lodash-es';
import { shallowEqual } from 'shallow-equal';
import { once, S, useCombine, useCreate, useMap } from 'stative';

import type { IInterpolator } from '../../../../modules';
import type { CursorPositionInputs, SmoothPosition } from './type';

import { Completed } from '../../../completed';
import { getPreservedIndex } from './utils';

export * from './type';

export const CursorPosition = /*#__PURE__*/ once(function CursorPosition({
  revisions,
  ticks,
  enabled: _enabled,
  driver,
  interpolation: _interpolation,
}: CursorPositionInputs) {
  const configuration = useCombine(revisions, _enabled, driver, _interpolation);

  const completion = useCreate(S([Completed, { source: configuration }]));

  let index = sumBy(revisions.value.value, 'length');

  let interpolator: IInterpolator | null = null;

  return useMap(
    [configuration, ticks, completion],
    (current, previous): SmoothPosition => {
      if (previous && shallowEqual(current, previous[0])) {
        return previous[1];
      }

      const [[currentRevisions, enabled, , Interpolator], frame, completed] = current;

      const [[previousRevisions], previousFrame] = previous?.[0] ?? current;

      const total = sumBy(currentRevisions, 'length');

      index = enabled ? Math.min(index, total) : total;

      const preserved =
        enabled && currentRevisions !== previousRevisions
          ? getPreservedIndex(currentRevisions, previousRevisions, index)
          : index;

      const reset = preserved < index;

      index = preserved;

      if (!enabled) {
        interpolator = null;
      } else if (frame) {
        const previousTotal = sumBy(previousRevisions, 'length');

        const previousInterpolator = interpolator;

        if (!interpolator || interpolator.constructor !== Interpolator) {
          interpolator = new Interpolator();
        }

        const resumed = !frame.driver.running && index < total;

        const timestamp = resumed ? frame.driver.start() : frame.timestamp;

        if (
          interpolator !== previousInterpolator ||
          frame.driver !== previousFrame?.driver ||
          reset
        ) {
          interpolator.start(timestamp, index);

          interpolator.push(total - index);
        } else {
          if (resumed) {
            interpolator.resume(timestamp);
          }

          if (total < previousTotal) {
            interpolator.reset(index);

            interpolator.push(total - index);
          } else if (total > previousTotal) {
            interpolator.push(total - previousTotal);
          }

          if (!resumed && frame !== previousFrame) {
            index = Math.min(total, index + Math.max(0, interpolator.tick(frame.timestamp)));
          }
        }
      }

      if (
        index === total &&
        frame?.driver.running &&
        (completed || !interpolator || interpolator.idle)
      ) {
        frame.driver.stop();
      }

      if (completed && index === total) {
        ticks.destroy();
      }

      let charIndex = index;

      if (index === total) {
        return {
          blockIndex: currentRevisions.length - 1,
          charIndex: enabled ? (currentRevisions.at(-1)?.length ?? 0) : Infinity,
        };
      }

      if (total > 0) {
        for (const [blockIndex, { length }] of currentRevisions.entries()) {
          if (charIndex <= length) {
            return { blockIndex, charIndex };
          }

          charIndex -= length;
        }
      }

      return { blockIndex: -1, charIndex: 0 };
    },
    shallowEqual,
  );
});
