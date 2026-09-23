import { shallowEqual } from 'shallow-equal';
import { mapClosure, once, useSwitchMap } from 'stative';

import type { BlockRevisionsInputs } from './type';

export * from './type';

export const BlockRevisions = /*#__PURE__*/ once(function BlockRevisions<T>({
  source,
}: BlockRevisionsInputs<T>) {
  return useSwitchMap(
    source,
    (blocks) =>
      blocks.map(({ baseLength, prevPrefixLength }) =>
        prevPrefixLength
          ? mapClosure(prevPrefixLength, () => ({
              length: baseLength.value,
              prefixLength: prevPrefixLength.value,
            }))
          : mapClosure(baseLength, (length) => ({ length, prefixLength: Infinity })),
      ),
    shallowEqual,
  );
});
