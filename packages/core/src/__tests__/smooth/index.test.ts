import type {
  SmoothInputs,
  SmoothSchedulerClass,
  SmoothTickerClass,
} from '@fluxdown/core-plugins/plugins/mapper/smooth';
import type { IBlockState } from '@fluxdown/types';
import type { IReactiveState, IReadableClosure } from 'stative';

import { expectTypeOf } from 'expect-type';

import type { HastRoot } from '../../typings';

import { setupSmooth } from './utils';

test('Smooth exposes closure inputs and reactive HAST blocks', () => {
  expectTypeOf<SmoothInputs<HastRoot>>()
    .toHaveProperty('source')
    .toEqualTypeOf<IReadableClosure<IBlockState<HastRoot>[]>>();

  expectTypeOf<Required<SmoothInputs<HastRoot>>>()
    .toHaveProperty('enabled')
    .toEqualTypeOf<IReadableClosure<boolean | undefined>>();

  expectTypeOf<Required<SmoothInputs<HastRoot>>>()
    .toHaveProperty('ticker')
    .toEqualTypeOf<IReadableClosure<SmoothTickerClass | undefined>>();

  expectTypeOf<Required<SmoothInputs<HastRoot>>>()
    .toHaveProperty('scheduler')
    .toEqualTypeOf<IReadableClosure<SmoothSchedulerClass | undefined>>();

  const { state } = setupSmooth();

  expectTypeOf<typeof state.value>().toEqualTypeOf<IReactiveState<IBlockState<HastRoot>[]>>();

  state.destroy();
});
