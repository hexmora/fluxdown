import type { BlockCompilerConfig, IPatchItem, MapperPluggable } from '@fluxdown/core';
import type {
  DriverType,
  InterpolationType,
  SmoothDriverClass,
  SmoothInterpolatorClass,
} from '@fluxdown/core-plugins/plugins/mapper/smooth';
import type { IPluginItem, Theme } from '@fluxdown/lynx-plugins/typings';
import type { IPluggableConfig } from '@fluxdown/types';
import type { ReactNode } from '@lynx-js/react';
import type { CSSProperties } from '@lynx-js/types';
import type { IReadableClosure } from 'stative';

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
  /** Additional class applied to the root view. */
  className?: string;

  /** Inline styles applied to the root view. */
  style?: CSSProperties;

  /** Preset theme, partial overrides, or a preset/overrides tuple. */
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
   * One plugin pack or an ordered list extending the compiler and Lynx renderer.
   */
  plugins: IPluginItem | IPluginItem[];
}

export type FluxdownRef = IReadableClosure<ReactNode[]>;
