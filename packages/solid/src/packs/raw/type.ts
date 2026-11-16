import type { BlockCompilerConfig, IPatchItem, MapperPluggable } from '@fluxdown/core';
import type {
  DriverType,
  InterpolationType,
  SmoothDriverClass,
  SmoothInterpolatorClass,
} from '@fluxdown/core-plugins/plugins/mapper/smooth';
import type { IPluginItem } from '@fluxdown/solid-plugins/typings';
import type { IPluggableConfig } from '@fluxdown/types';
import type { JSX } from 'solid-js';
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

export interface FluxdownRawProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'children' | 'ref'
> {
  /**
   * Receive the underlying readable Core instance.
   */
  ref?: (core: FluxdownRef) => void;

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
  patches?: IPatchItem<JSX.Element>[];

  /**
   * One plugin pack or an ordered list extending the compiler and Solid renderer.
   */
  plugins: IPluginItem | IPluginItem[];

  /**
   * Preset theme, deep partial overrides of light, or a preset/overrides tuple.
   */
  theme?: Theme;
}

/** Readable Core state containing internal renderer blocks. */
export type FluxdownRef = IReadableClosure<unknown[]>;
