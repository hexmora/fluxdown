import { PRESET_FULL_PLUGINS } from '@fluxdown/solid-plugins/full';

import type { FluxdownProps } from './type';

import { createMergedPlugins } from '../../hooks';
import { FluxdownRaw } from '../raw';

export type {
  BaseBuildConfig,
  EffectItem,
  FluxdownRawProps,
  FluxdownRef,
  SmoothConfig,
  StreamingConfig,
} from '../raw';
export * from '../../types';
export * from './type';

export const Fluxdown = (props: FluxdownProps) => {
  const plugins = createMergedPlugins(PRESET_FULL_PLUGINS, () => props.plugins);

  return <FluxdownRaw {...props} plugins={plugins()} />;
};
