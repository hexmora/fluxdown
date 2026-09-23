import { sumBy } from 'lodash-es';
import { shallowEqual } from 'shallow-equal';
import { once, S, useCombine, useCombineMap, useCreate } from 'stative';

import type { IScheduler } from '../../../../modules';
import type { CursorPositionInputs, SmoothPosition } from './type';

import { Completed } from '../../../completed';
import { getPreservedIndex } from './utils';

export * from './type';

export const CursorPosition = /*#__PURE__*/ once(function CursorPosition({
  revisions,
  ticks,
  enabled: _enabled,
  ticker,
  scheduler: _scheduler,
}: CursorPositionInputs) {
  const configuration = useCombine(revisions, _enabled, ticker, _scheduler);

  const completion = useCreate(S([Completed, { source: configuration }]));

  let index = sumBy(revisions.value.value, 'length');

  let scheduler: IScheduler | null = null;

  return useCombineMap(
    [configuration, ticks, completion],
    (current, previous): SmoothPosition => {
      if (previous && shallowEqual(current, previous[0])) {
        return previous[1];
      }

      const [[currentRevisions, enabled, , Scheduler], frame, completed] = current;

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
        scheduler = null;
      } else if (frame) {
        const previousTotal = sumBy(previousRevisions, 'length');

        const previousScheduler = scheduler;

        if (!scheduler || scheduler.constructor !== Scheduler) {
          scheduler = new Scheduler();
        }

        const resumed = !frame.ticker.running && index < total;

        const timestamp = resumed ? frame.ticker.start() : frame.timestamp;

        if (
          scheduler !== previousScheduler ||
          frame.ticker !== previousFrame?.ticker ||
          resumed ||
          reset
        ) {
          scheduler.start(timestamp, index);

          scheduler.push(total - index);
        } else {
          if (total < previousTotal) {
            scheduler.reset(index);

            scheduler.push(total - index);
          } else if (total > previousTotal) {
            scheduler.push(total - previousTotal);
          }

          if (frame !== previousFrame) {
            index = Math.min(total, index + Math.max(0, scheduler.tick(frame.timestamp)));
          }
        }
      }

      if (index === total && frame?.ticker.running) {
        frame.ticker.stop();
      }

      if (completed && index === total) {
        ticks.destroy();
      }

      let charIndex = index;

      if (index === total) {
        return {
          blockIndex: currentRevisions.length - 1,
          charIndex: currentRevisions.at(-1)?.length ?? 0,
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
