import { once, S, useCreate, useMap } from 'stative';

import type { CompiledBlockResultInputs } from './type';

import { BlockItem } from '../../../../../block-item';
import { isMetaEqual } from './utils';

export const CompiledBlockResult = /*#__PURE__*/ once(function CompiledBlockResult({
  item,
  count,
  key,
  source,
}: CompiledBlockResultInputs) {
  const meta = useMap(
    [item, count],
    ([
      {
        meta: current,
        section: { text },
      },
      blockCount,
    ]) => ({
      ...current,
      blockCount,
      key,
      sourceText: text,
    }),
    isMetaEqual,
  );

  const block = useCreate(S([BlockItem, { source, meta }]));

  // Keep compilation active while exposing the stable block instance.
  return useMap(source, () => block);
});
