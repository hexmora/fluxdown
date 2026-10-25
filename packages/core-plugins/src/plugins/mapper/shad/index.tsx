/**
 * @jsxImportSource stative
 */

import type { IBlockState } from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

import { type IReadableClosure, once, useDefaults, useSwitchMap } from 'stative';

import type { ShadInputs, ShadPluginConfig } from './type';

import { withKey } from '../../../utils';
import { ShadBlocks } from './states';
import { SHAD_DEFAULT_DURATION, SHAD_DEFAULT_LENGTH } from './utils';

export * from './type';
export { SHAD_DATA_ATTR, SHAD_FADE_VALUE, SHAD_TAG_NAME } from './utils';

declare global {
  interface EffectConfigs {
    shad: ShadPluginConfig;
  }

  interface MapperConfigs {
    shad: ShadPluginConfig;
  }
}

export const Shad = /*#__PURE__*/ withKey(
  'shad',
  /*#__PURE__*/ once(function Shad({
    source,
    enabled: _enabled,
    length: _length,
    duration: _duration,
  }: ShadInputs): IReadableClosure<IBlockState<HastRoot>[]> {
    const enabled = useDefaults(_enabled, false);

    const length = useDefaults(_length, SHAD_DEFAULT_LENGTH);

    const duration = useDefaults(_duration, SHAD_DEFAULT_DURATION);

    return useSwitchMap(enabled, (active) =>
      active ? <ShadBlocks source={source} length={length} duration={duration} /> : source,
    );
  }),
);
