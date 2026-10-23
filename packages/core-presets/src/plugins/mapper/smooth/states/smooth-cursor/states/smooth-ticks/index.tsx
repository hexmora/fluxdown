/**
 * @jsxImportSource stative
 */

import { sumBy } from 'lodash-es';
import { D, type JSXDescriptor, once, useMap, useSwitchMap } from 'stative';

import type { SmoothDriverClass } from '../../../../type';
import type { SmoothTicksInputs } from './type';

import { DriverFrames, type SmoothTick } from './states';

export * from './type';

export const SmoothTicks = /*#__PURE__*/ once(function SmoothTicks({
  enabled: _enabled,
  driver: _driver,
  revisions: _revisions,
}: SmoothTicksInputs) {
  const active = useMap(
    [_enabled, _driver, _revisions],
    ([enabled, Driver, revisions], previous): SmoothDriverClass | null => {
      if (!previous) {
        return null;
      }

      const [[, , previousRevisions], prevDriver] = previous;

      const replaced = revisions.some(
        (revision, index) =>
          revision !== previousRevisions[index] && Number.isFinite(revision.prefixLength),
      );

      return enabled &&
        (prevDriver || replaced || sumBy(revisions, 'length') > sumBy(previousRevisions, 'length'))
        ? Driver
        : null;
    },
  );

  return useSwitchMap(active, (Driver): JSXDescriptor<SmoothTick> | null =>
    Driver ? <DriverFrames Driver={D(Driver)} /> : null,
  );
});
