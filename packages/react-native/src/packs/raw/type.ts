import type { FluxdownBaseProps } from '@fluxdown/react-base';
import type { IPluginItem } from '@fluxdown/react-base-plugins/typings';
import type { Theme } from '@fluxdown/react-native-plugins/typings';
import type { StyleProp, ViewStyle } from 'react-native';

export type {
  BaseBuildConfig,
  EffectItem,
  FluxdownRef,
  SmoothConfig,
  StreamingConfig,
} from '@fluxdown/react-base';

export interface FluxdownRawProps extends Omit<FluxdownBaseProps, 'getProps' | 'plugins'> {
  /**
   * Styles applied to the rendered root.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Preset theme, deep partial overrides of light, or a preset/overrides tuple.
   */
  theme?: Theme;

  /**
   * One plugin pack or an ordered list extending the compiler and React renderer.
   */
  plugins: IPluginItem | IPluginItem[];
}
