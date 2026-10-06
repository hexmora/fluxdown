import type { IRangeState } from '@fluxdown/types';

import { isEqual } from 'lodash-es';
import { D, once, useClearable, useCombineMap, useMap, useSwitchMap } from 'stative';

import type { CutoffBlockInputs } from './type';

import { isMetaEqual } from './utils';

export * from './type';

export const CutoffBlock = /*#__PURE__*/ once(function CutoffBlock<T>({
  source,
  end,
  count,
}: CutoffBlockInputs<T>) {
  const meta = useCombineMap(
    [source.meta, count],
    ([current, blockCount]) => ({ ...current, blockCount }),
    isMetaEqual,
  );

  const boundary = useMap(end, (offset) => offset !== null);

  const length = useSwitchMap(boundary, (active) => (active ? source.baseLength : null));

  const range = useCombineMap(
    [end, length],
    ([offset, currentLength]): IRangeState | null =>
      offset === null || currentLength === 0 ? null : { start: 0, end: offset },
    isEqual,
  );

  const fork = useClearable(source.fork({ meta: meta.value, range: range.value }));

  return D(fork);
});
