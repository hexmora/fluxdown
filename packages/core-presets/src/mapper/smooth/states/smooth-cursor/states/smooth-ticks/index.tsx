/**
 * @jsxImportSource stative
 */

import { sumBy } from 'lodash-es';
import { D, type JSXDescriptor, once, useCombineMap, useSwitchMap } from 'stative';

import type { SmoothTickerClass } from '../../../../type';
import type { SmoothTicksInputs } from './type';

import { type SmoothTick, TickerFrames } from './states';

export * from './type';

export const SmoothTicks = /*#__PURE__*/ once(function SmoothTicks({
  enabled: _enabled,
  ticker: _ticker,
  revisions: _revisions,
}: SmoothTicksInputs) {
  const active = useCombineMap(
    [_enabled, _ticker, _revisions],
    ([enabled, Ticker, revisions], previous): SmoothTickerClass | null => {
      if (!previous) {
        return null;
      }

      const [[, , previousRevisions], prevTicker] = previous;

      const replaced = revisions.some(
        (revision, index) =>
          revision !== previousRevisions[index] && Number.isFinite(revision.prefixLength),
      );

      return enabled &&
        (prevTicker || replaced || sumBy(revisions, 'length') > sumBy(previousRevisions, 'length'))
        ? Ticker
        : null;
    },
  );

  return useSwitchMap(active, (Ticker): JSXDescriptor<SmoothTick> | null =>
    Ticker ? <TickerFrames Ticker={D(Ticker)} /> : null,
  );
});
