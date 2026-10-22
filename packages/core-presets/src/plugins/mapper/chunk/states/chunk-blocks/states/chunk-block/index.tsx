/**
 * @jsxImportSource stative
 */

import { D, once, render, useClearable } from 'stative';

import type { ChunkBlockInputs } from './type';

import { ChunkValue } from './states';

export const ChunkBlock = /*#__PURE__*/ once(function ChunkBlock({
  source,
  ...config
}: ChunkBlockInputs) {
  const fork = useClearable(
    source.fork({
      mapper: (_value, current) =>
        render(<ChunkValue source={D(source)} current={D(current)} {...config} />),
    }),
  );

  return D(fork);
});
