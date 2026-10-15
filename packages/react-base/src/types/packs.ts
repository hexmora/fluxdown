import type { BlockCompilerConfig, IPatchItem, MapperPluggable } from '@fluxdown/core';
import type { ShadConfig as CoreShadConfig, SmoothConfig } from '@fluxdown/core-presets/mapper';
import type { AnySlotPluggable, IReactRenderPluggable } from '@fluxdown/react-base-presets/base';
import type { IPluggable, IRehypePlugin, IRemarkPlugin, IRepairPlugin } from '@fluxdown/types';
import type { ReactNode } from 'react';
import type { IReadableClosure } from 'stative';

import type { PluginConfigs } from './plugins.js';

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

export type ShadConfig = CoreShadConfig;

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
   * Fade the trailing characters of newly revealed content.
   * @default true
   */
  shad?: boolean | ShadConfig;
}

export interface BaseFluxdownProps {
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
   * Plugin packs extending the compiler and React renderer.
   */
  plugins?: IPluginItem[];
}

export type BaseFluxdownRef = IReadableClosure<ReactNode[]>;
