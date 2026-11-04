/**
 * @jsxImportSource stative
 */

import { D, once, render, useClearable } from 'stative';

import type { ShadBlockInputs } from './type';

import { ShadValue } from './states';

export * from './type';

export const ShadBlock = /*#__PURE__*/ once(function ShadBlock({
  source,
  concurrency,
  ...config
}: ShadBlockInputs) {
  const fork = useClearable(
    source.fork({
      mapper: (_value, current) =>
        render(
          <ShadValue
            source={D(source)}
            current={D(current)}
            concurrency={D(concurrency)}
            {...config}
          />,
        ),
    }),
  );

  return D(fork);
});
