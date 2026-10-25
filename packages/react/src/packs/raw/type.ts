import type { FluxdownBaseProps } from '@fluxdown/react-base';
import type { IPluginItem } from '@fluxdown/react-base-plugins/typings';
import type { CSSProperties } from 'react';

import type { Theme } from '../../types';

export type {
  BaseBuildConfig,
  EffectItem,
  FluxdownRef,
  SmoothConfig,
  StreamingConfig,
} from '@fluxdown/react-base';

export interface FluxdownRawProps extends Omit<FluxdownBaseProps, 'getProps' | 'plugins'> {
  /**
   * Additional class name applied to the rendered root.
   */
  className?: string;

  /**
   * Inline styles applied to the rendered root.
   */
  style?: CSSProperties;

  /**
   * Preset theme, deep partial overrides of light, or a preset/overrides tuple.
   */
  theme?: Theme;

  /**
   * One plugin pack or an ordered list extending the compiler and React renderer.
   */
  plugins: IPluginItem | IPluginItem[];
}
