/**
 * @jsxImportSource stative
 */

import type { IBlockState } from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

import { type IReadableClosure, once, useDefaults, useSwitchMap } from 'stative';

import type { ScaleInputs, ScalePluginConfig } from './type';

import { withKey } from '../../../utils';
import { ScaleBlocks } from './states';

export * from './type';
export { SCALE_CHAR_VALUE, SCALE_DATA_ATTR, SCALE_TAG_NAME, SCALE_WORD_VALUE } from './utils';

declare global {
  interface EffectConfigs {
    scale: ScalePluginConfig;
  }

  interface MapperConfigs {
    scale: ScalePluginConfig;
  }
}

export const Scale = /*#__PURE__*/ withKey(
  'scale',
  /*#__PURE__*/ once(function Scale({
    source,
    enabled: _enabled,
    duration: _duration,
    from: _from,
    blur: _blur,
  }: ScaleInputs): IReadableClosure<IBlockState<HastRoot>[]> {
    const enabled = useDefaults(_enabled, false);

    const duration = useDefaults(_duration, 200);

    const from = useDefaults(_from, 0);

    const blur = useDefaults(_blur, 0.08);

    return useSwitchMap(enabled, (active) =>
      active ? <ScaleBlocks source={source} duration={duration} from={from} blur={blur} /> : source,
    );
  }),
);
