/**
 * @jsxImportSource stative
 */

import { D, once, useMapKeyed } from 'stative';

import type { ScaleBlocksInputs } from './type';

import { ScaleBlock } from './states';

export const ScaleBlocks = /*#__PURE__*/ once(function ScaleBlocks({
  source,
  ...config
}: ScaleBlocksInputs) {
  const initial = new WeakSet(source.value.value);

  return useMapKeyed(source, (block) => (
    <ScaleBlock source={D(block)} initial={initial.has(block)} {...config} />
  ));
});
