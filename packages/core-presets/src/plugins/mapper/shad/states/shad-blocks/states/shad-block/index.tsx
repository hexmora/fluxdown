/**
 * @jsxImportSource stative
 */

import type { IBlockState } from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

import { D, type IReactiveState, once, ReactiveState, render, useClearable } from 'stative';

import type { ShadBlockInputs } from './type';

import { ShadValue } from './states';

export const ShadBlock = /*#__PURE__*/ once(function ShadBlock({
  source,
  tail,
  progress,
  maskWidth,
}: ShadBlockInputs): IReactiveState<IBlockState<HastRoot>> {
  const fork = useClearable(
    source.fork({
      mapper: (_value, current) =>
        render(
          <ShadValue
            source={D(source)}
            current={D(current)}
            tail={tail}
            progress={progress}
            maskWidth={maskWidth}
          />,
        ),
    }),
  );

  return ReactiveState.of(fork);
});
