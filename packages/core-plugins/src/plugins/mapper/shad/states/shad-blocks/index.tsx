/**
 * @jsxImportSource stative
 */

import { D, mapClosure, once, useMapKeyed, useSwitchMap } from 'stative';

import type { ShadBlocksInputs } from './type';

import { FadeConcurrency } from '../../utils';
import { ShadBlock } from './states';

export * from './type';

export const ShadBlocks = /*#__PURE__*/ once(function ShadBlocks({
  source,
  ...config
}: ShadBlocksInputs) {
  const initial = new WeakSet(source.value.value);

  // One count for every block, so a batch crossing a block boundary is sized as one batch.
  const concurrency = new FadeConcurrency();

  const clock = useSwitchMap(source, (blocks) =>
    mapClosure(
      blocks.map((block) => block.value),
      () => performance.now(),
    ),
  );

  // Read the complete incoming revision once, so a batch crossing block boundaries
  // shares an entrance time even when its individual blocks render later.
  void clock.value;

  return useMapKeyed(source, (block) => (
    <ShadBlock
      source={D(block)}
      initial={initial.has(block)}
      clock={clock}
      concurrency={D(concurrency)}
      {...config}
    />
  ));
});
