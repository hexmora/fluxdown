import type { BlockCompilerConfig } from '@fluxdown/core';
import type {
  SmoothDriverClass,
  SmoothInterpolatorClass,
} from '@fluxdown/core-plugins/plugins/mapper/smooth';

import type { BottomScrollMode } from '../../../bottom-scroll';

export type PreviewBuild = Partial<Omit<BlockCompilerConfig, 'repairEnding'>>;

export type Renderer =
  | 'react'
  | 'vue'
  | 'svelte'
  | 'react-native'
  | 'lynx'
  | 'solid'
  | 'taro'
  | 'angular';

export type PreviewEffect = 'scale' | 'shad' | 'chunk' | 'suffix';

export type PreviewEffectItem =
  | PreviewEffect
  | ['scale', { duration?: number }]
  | ['shad', { length?: number; duration?: number }]
  | ['chunk', { duration?: number }]
  | ['suffix', { type: 'cursor' | 'dot' }];

export type PreviewSmooth =
  | boolean
  | {
      enabled?: boolean;

      /**
       * Classes do not cross into the Lynx preview, which falls back to its default driver.
       */
      driver?: SmoothDriverClass;

      interpolation?: SmoothInterpolatorClass;
    };

export type PreviewStreaming =
  | boolean
  | {
      effect?: boolean | PreviewEffectItem;
      smooth?: PreviewSmooth;
      repairEnding?: boolean;
    };

export interface RendererPreviewProps {
  renderer: Renderer;
  text: string;
  streaming?: PreviewStreaming;
  scrollMode?: BottomScrollMode;
  build?: PreviewBuild;
  dark: boolean;
  cycle?: number;
  reducedMotion?: boolean;
}
