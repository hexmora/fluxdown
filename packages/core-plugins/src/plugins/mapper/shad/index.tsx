/**
 * @jsxImportSource stative
 */

import type { IBlockState } from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

import { type IReadableClosure, once, useDefaults, useSwitchMap } from 'stative';

import type { ShadInputs, ShadPluginConfig } from './type';

import { withKey } from '../../../utils';
import { ShadBlocks, ShadProgress } from './states';

export * from './type';
export { SHAD_DATA_ATTR, SHAD_HOST_VALUE, SHAD_TAG_NAME } from './utils';

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
    maskWidth: _maskWidth,
  }: ShadInputs): IReadableClosure<IBlockState<HastRoot>[]> {
    const enabled = useDefaults(_enabled, false);

    const length = useDefaults(_length, 10);

    const maskWidth = useDefaults(_maskWidth, 15);

    return useSwitchMap(enabled, (active) =>
      active ? (
        <ShadBlocks
          source={source}
          progress={<ShadProgress source={source} enabled={enabled} length={length} />}
          maskWidth={maskWidth}
        />
      ) : (
        source
      ),
    );
  }),
);
