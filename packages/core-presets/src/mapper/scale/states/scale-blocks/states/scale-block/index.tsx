/**
 * @jsxImportSource stative
 */

import { D, once, render, useClearable } from 'stative';

import type { ScaleBlockInputs } from './type';

import { ScaleValue } from './states';

export const ScaleBlock = /*#__PURE__*/ once(function ScaleBlock({
  source,
  ...config
}: ScaleBlockInputs) {
  const fork = useClearable(
    source.fork({
      mapper: (_value, current) =>
        render(<ScaleValue source={D(source)} current={D(current)} {...config} />),
    }),
  );

  return D(fork);
});
