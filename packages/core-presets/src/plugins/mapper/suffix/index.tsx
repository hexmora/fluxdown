/**
 * @jsxImportSource stative
 */

import type { IBlockState } from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

import { type IReadableClosure, once, useDefaults, useSwitchMap } from 'stative';

import type { SuffixInputs, SuffixPluginConfig, SuffixType } from './type';

import { withKey } from '../../../utils';
import { SuffixBlocks } from './states';

export * from './type';
export { SUFFIX_DATA_ATTR, SUFFIX_TAG_NAME, isSuffixNode } from './utils';

declare global {
  interface EffectConfigs {
    suffix: SuffixPluginConfig;
  }

  interface MapperConfigs {
    suffix: SuffixPluginConfig;
  }
}

export const Suffix = /*#__PURE__*/ withKey(
  'suffix',
  /*#__PURE__*/ once(function Suffix({
    source,
    enabled: _enabled,
    type: _type,
  }: SuffixInputs): IReadableClosure<IBlockState<HastRoot>[]> {
    const enabled = useDefaults(_enabled, false);
    const type = useDefaults<SuffixType>(_type, 'cursor');

    return useSwitchMap(enabled, (active) =>
      active ? <SuffixBlocks source={source} type={type} /> : source,
    );
  }),
);
