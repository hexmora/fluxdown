import type {
  SmoothDriverClass,
  SmoothInputs,
  SmoothInterpolatorClass,
} from '@fluxdown/core-presets/plugins/mapper/smooth';
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
    .toHaveProperty('driver')
    .toEqualTypeOf<IReadableClosure<SmoothDriverClass | undefined>>();

  expectTypeOf<Required<SmoothInputs<HastRoot>>>()
    .toHaveProperty('interpolation')
    .toEqualTypeOf<IReadableClosure<SmoothInterpolatorClass | undefined>>();

  const { state } = setupSmooth();

  expectTypeOf<typeof state.value>().toEqualTypeOf<IReactiveState<IBlockState<HastRoot>[]>>();

  state.destroy();
});
