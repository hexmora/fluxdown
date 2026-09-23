import type { IBlockState } from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

import { last } from 'lodash-es';
import { shallowEqual } from 'shallow-equal';
import { once, useClearable, useMap } from 'stative';

import type { ShadBlockEntry, ShadBlocksInputs } from './type';

import { clearShadBlocks, toShadBlocks } from './utils';

export const ShadBlocks = /*#__PURE__*/ once(function ShadBlocks({
  source,
  progress,
}: ShadBlocksInputs) {
  const entries = new Map<IBlockState<HastRoot>, ShadBlockEntry>();

  useClearable(() => clearShadBlocks(entries));

  const tail = useMap(source, (blocks) => last(blocks));

  // Start the growth window before an individual block's value is first read.
  void progress.value;

  const blocks = useMap(
    source,
    (items) => toShadBlocks(entries, items, tail, progress),
    shallowEqual,
  );

  return blocks;
});
