import type { FluxdownBaseProps } from '@fluxdown/vue-base';
import type { IPluginItem } from '@fluxdown/vue-base-plugins/typings';

import type { Theme } from '../../types';

export type {
  BaseBuildConfig,
  EffectItem,
  FluxdownRef,
  SmoothConfig,
  StreamingConfig,
} from '@fluxdown/vue-base';

export interface FluxdownRawProps extends Omit<FluxdownBaseProps, 'getProps' | 'plugins'> {
  /**
   * One plugin pack or an ordered list extending the compiler and Vue renderer.
   */
  plugins: IPluginItem | IPluginItem[];

  /**
   * Preset theme, deep partial overrides of light, or a preset/overrides tuple.
   */
  theme?: Theme;
}
