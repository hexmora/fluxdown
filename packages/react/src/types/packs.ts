import type { BlockCompilerConfig, IPatchItem, MapperPluggable } from '@fluxdown/core';
import type {
  SchedulerType,
  SmoothSchedulerClass,
  SmoothTickerClass,
  TickerType,
} from '@fluxdown/core-presets/mapper';
import type { AnySlotPluggable, IReactRenderPluggable } from '@fluxdown/react-presets/base';
import type {
  IPluggable,
  IPluggableConfig,
  IRehypePlugin,
  IRemarkPlugin,
  IRepairPlugin,
} from '@fluxdown/types';
import type { CSSProperties, ReactNode } from 'react';
import type { IReadableClosure } from 'stative';

import type { PluginConfigs } from './plugins.js';
import type { Theme } from './theme';

export interface IPluginItem {
  config?: PluginConfigs;

  remarks?: IPluggable<IRemarkPlugin, unknown>[];

  rehypes?: IPluggable<IRehypePlugin, unknown>[];

  repairs?: IPluggable<IRepairPlugin, unknown>[];

  mappers?: MapperPluggable[];

  renders?: IReactRenderPluggable[];

  slots?: AnySlotPluggable[];
}

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
   * Built-in timestamp source name or a custom ticker constructor.
   */
  ticker: TickerType | SmoothTickerClass;

  /**
   * Built-in progress scheduler name or a custom scheduler constructor.
   */
  scheduler: SchedulerType | SmoothSchedulerClass;
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

export interface FluxdownProps {
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
  plugins?: IPluginItem | IPluginItem[];
}

export type FluxdownRef = IReadableClosure<ReactNode[]>;
