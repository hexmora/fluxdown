import { PRESET_LITE_PLUGINS } from '@fluxdown/solid-plugins/lite';

import type { FluxdownLiteProps } from './type';

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

export const FluxdownLite = (props: FluxdownLiteProps) => {
  const plugins = createMergedPlugins(PRESET_LITE_PLUGINS, () => props.plugins);

  return <FluxdownRaw {...props} plugins={plugins()} />;
};
