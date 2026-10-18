import type { BaseFluxdownProps, BaseFluxdownRef } from '@fluxdown/react-base';
import type { MarkdownStyles, Theme } from '@fluxdown/react-native-presets/base';
import type { ViewProps } from 'react-native';

export type {
  BaseBuildConfig,
  IPluginItem,
  PluginConfigs,
  ShadConfig,
  StreamingConfig,
} from '@fluxdown/react-base';

export interface FluxdownProps
  extends Omit<BaseFluxdownProps, 'Renderer'>, Omit<ViewProps, 'children'> {
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
