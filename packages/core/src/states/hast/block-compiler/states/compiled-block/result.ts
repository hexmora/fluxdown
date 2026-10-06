import type { IReadableClosure } from 'stative';

import { once, S, useComputed, useCreate, useMap } from 'stative';

import type { HastRoot } from '../../../../../typings';
import type { BlockContentInputs } from './type';

import { BlockItem } from '../../../block-item';
import { isMetaEqual } from './utils';

type Inputs = Pick<BlockContentInputs, 'item' | 'count' | 'key'> & {
  source: IReadableClosure<HastRoot>;
};

export const CompiledBlockResult = /*#__PURE__*/ once(function CompiledBlockResult({
  item,
  count,
  key,
  source,
}: Inputs) {
  const meta = useComputed(
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
