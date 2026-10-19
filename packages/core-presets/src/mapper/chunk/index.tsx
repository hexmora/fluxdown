/**
 * @jsxImportSource stative
 */

import type { IBlockState } from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

import { type IReadableClosure, once, useDefaults, useSwitchMap } from 'stative';

import type { ChunkInputs, ChunkPluginConfig } from './type';

import { withKey } from '../../utils';
import { ChunkBlocks } from './states';

export * from './type';
export { CHUNK_DATA_ATTR, CHUNK_TAG_NAME } from './utils';

declare global {
  interface EffectConfigs {
    chunk: ChunkPluginConfig;
  }

  interface MapperConfigs {
    chunk: ChunkPluginConfig;
  }
}

export const Chunk = /*#__PURE__*/ withKey(
  'chunk',
  /*#__PURE__*/ once(function Chunk({
    source,
    enabled: _enabled,
    duration: _duration,
  }: ChunkInputs): IReadableClosure<IBlockState<HastRoot>[]> {
    const enabled = useDefaults(_enabled, false);

    const duration = useDefaults(_duration, 400);

    return useSwitchMap(enabled, (active) =>
      active ? <ChunkBlocks source={source} duration={duration} /> : source,
    );
  }),
);
