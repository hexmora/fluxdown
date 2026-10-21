import type { BaseFluxdownProps, BaseFluxdownRef } from '@fluxdown/react-base';
import type { MarkdownStyles, Theme } from '@fluxdown/react-native-presets/base';
import type { ViewProps } from 'react-native';

export type {
  BaseBuildConfig,
  IPluginItem,
  PluginConfigs,
  EffectItem,
  SmoothConfig,
  StreamingConfig,
} from '@fluxdown/react-base';

export interface FluxdownRawProps
  extends Omit<BaseFluxdownProps, 'Renderer' | 'plugins'>, Omit<ViewProps, 'children'> {
  plugins: NonNullable<BaseFluxdownProps['plugins']>;

  /**
   * Preset theme, deep partial overrides of light, or a preset/overrides tuple.
   */
  theme?: Theme;

  /**
   * Native styles applied to individual Markdown elements.
   */
  styles?: MarkdownStyles;

  /**
   * Allow selection of rendered text.
   * @default false
   */
  selectable?: boolean;
}

export type FluxdownRef = BaseFluxdownRef;

export type FluxdownProps = Omit<FluxdownRawProps, 'plugins'> & {
  plugins?: FluxdownRawProps['plugins'];
};

export type FluxdownLiteProps = FluxdownProps;
