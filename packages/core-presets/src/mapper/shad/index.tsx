/**
 * @jsxImportSource stative
 */

import type { IBlockState, IPluggableConfig } from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

import { type IReadableClosure, once, useDefaults, useSwitchMap } from 'stative';

import type { ShadBaseInputs, ShadInputs } from './type';

import { withKey } from '../../utils';
import { ShadBlocks, ShadProgress } from './states';

export * from './type';
export { SHAD_DATA_ATTR, SHAD_HOST_VALUE, SHAD_TAG_NAME } from './utils';

declare global {
  interface MapperConfigs {
    shad?: IPluggableConfig<ShadBaseInputs>;
  }
}

export const Shad = /*#__PURE__*/ withKey(
  'shad',
  /*#__PURE__*/ once(function Shad({
    source,
    enabled: _enabled,
    length: _length,
  }: ShadInputs): IReadableClosure<IBlockState<HastRoot>[]> {
    const enabled = useDefaults(_enabled, false);

    const length = useDefaults(_length, 2);

    return useSwitchMap(enabled, (active) =>
      active ? (
        <ShadBlocks
          source={source}
          progress={<ShadProgress source={source} enabled={enabled} length={length} />}
        />
      ) : (
        source
      ),
    );
  }),
);
