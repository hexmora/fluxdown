import type { BaseFluxdownProps, BaseFluxdownRef } from '@fluxdown/react-base';
import type { IPluginItem } from '@fluxdown/react-presets/typings';
import type { CSSProperties } from 'react';

import type { Theme } from '../../types';

export type {
  BaseBuildConfig,
  EffectItem,
  SmoothConfig,
  StreamingConfig,
} from '@fluxdown/react-base';

export interface FluxdownRawProps extends Omit<BaseFluxdownProps, 'Renderer' | 'plugins'> {
  /** Additional class name applied to the rendered root. */
  className?: string;

  /** Inline styles applied to the rendered root. */
  style?: CSSProperties;

  /** Preset theme, partial overrides, or a preset/overrides tuple. */
  theme?: Theme;

  /** One plugin pack or an ordered list extending the compiler and renderer. */
  plugins: IPluginItem | IPluginItem[];
}

export type FluxdownRef = BaseFluxdownRef;
