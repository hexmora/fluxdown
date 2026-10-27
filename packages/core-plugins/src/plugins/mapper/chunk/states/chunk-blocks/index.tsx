/** @jsxImportSource stative */

import { getTime } from '@fluxdown/utils';
import { D, mapClosure, once, useMapKeyed, useSwitchMap } from 'stative';

import type { ChunkBlocksInputs } from './type';

import { ChunkBlock } from './states';

export const ChunkBlocks = /*#__PURE__*/ once(function ChunkBlocks({
  source,
  ...config
}: ChunkBlocksInputs) {
  const initial = new WeakSet(source.value.value);

  const clock = useSwitchMap(source, (blocks) =>
    mapClosure(
      blocks.map((block) => block.value),
      () => getTime(),
    ),
  );

  // Read the complete incoming revision once, so a batch crossing block boundaries
  // shares an entrance time even when its individual blocks render later.
  void clock.value;

  return useMapKeyed(source, (block) => (
    <ChunkBlock source={D(block)} initial={initial.has(block)} clock={clock} {...config} />
  ));
});
