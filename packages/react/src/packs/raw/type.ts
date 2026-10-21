import type { BlockCompilerConfig, IPatchItem, MapperPluggable } from '@fluxdown/core';
import type {
  DriverType,
  InterpolationType,
  SmoothDriverClass,
  SmoothInterpolatorClass,
} from '@fluxdown/core-presets/mapper';
import type { IPluginItem } from '@fluxdown/react-presets/typings';
import type { IPluggableConfig } from '@fluxdown/types';
import type { CSSProperties, ReactNode } from 'react';
import type { IReadableClosure } from 'stative';

import type { Theme } from '../../types';

export type BaseBuildConfig = Partial<Omit<BlockCompilerConfig, 'repairEnding'>>;

export type EffectItem =
  | keyof EffectConfigs
  | { [K in keyof EffectConfigs]: [K, IPluggableConfig<EffectConfigs[K]>] }[keyof EffectConfigs]
  | MapperPluggable;

export interface SmoothConfig {
  /**
   * Reveal newly compiled content over successive ticks.
   * @default false
   */
  enabled?: boolean;

  /**
   * Built-in driver name or a custom driver constructor that supplies animation timestamps.
   * @default 'raf' when animation frames are available, otherwise 'interval'
   */
  driver?: DriverType | SmoothDriverClass;

  /**
   * Built-in interpolation name or a custom interpolator constructor that turns elapsed time
   * into visible progress.
   * @default 'spring'
   */
  interpolation?: InterpolationType | SmoothInterpolatorClass;

  /**
   * @deprecated Renamed to `driver`.
   */
  ticker?: DriverType | SmoothDriverClass;

  /**
   * @deprecated Renamed to `interpolation`.
   */
  scheduler?: InterpolationType | SmoothInterpolatorClass;
}

export interface StreamingConfig {
  /**
   * Repair incomplete Markdown syntax at the end of the document.
   * @default true
   */
  repairEnding?: boolean;

  /**
   * Smoothly reveal appended compiled content.
   * @default true
   */
  smooth?: boolean | SmoothConfig;

  /**
   * One effect or an ordered list of effects applied to newly revealed content.
   * Set to true to enable the default scale entrance, or false to disable effects.
   * @default 'scale'
   */
  effect?: boolean | EffectItem | EffectItem[];
}

export interface FluxdownRawProps {
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
   * Markdown source text to compile and render.
   */
  text: string;

  /**
   * Static build configuration.
   */
  build?: BaseBuildConfig;

  /**
   * Streaming effect configuration.
   * @default false
   */
  streaming?: boolean | StreamingConfig;

  /**
   * Inline render patches applied to the Markdown source.
   */
  patches?: IPatchItem<ReactNode>[];

  /**
   * One plugin pack or an ordered list extending the compiler and React renderer.
   */
  plugins: IPluginItem | IPluginItem[];
}

export type FluxdownRef = IReadableClosure<ReactNode[]>;
