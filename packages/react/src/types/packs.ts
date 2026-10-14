import type {
  BaseFluxdownProps,
  BaseFluxdownRef,
  ShadConfig as BaseShadConfig,
  StreamingConfig as BaseStreamingConfig,
} from '@fluxdown/react-base';
import type { CSSProperties } from 'react';

import type { Theme } from './theme';

export type { BaseBuildConfig, IPluginItem, PluginConfigs } from '@fluxdown/react-base';

export interface ShadConfig extends BaseShadConfig {
  /**
   * Width of the trailing mask in pixels. Set to 0 to hide it.
   * @default 15
   */
  maskWidth?: number;
}

export interface StreamingConfig extends BaseStreamingConfig {
  shad?: boolean | ShadConfig;
}

export interface FluxdownProps extends Omit<BaseFluxdownProps, 'streaming'> {
  className?: string;

  style?: CSSProperties;

  theme?: Theme;

  streaming?: boolean | StreamingConfig;
}

export type FluxdownRef = BaseFluxdownRef;
