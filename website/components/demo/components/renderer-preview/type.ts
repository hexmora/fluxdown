import type { BlockCompilerConfig } from '@fluxdown/core';

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

export type PreviewStreaming =
  | boolean
  | {
      effect?: boolean | PreviewEffect | ['suffix', { type: 'cursor' | 'dot' }];
      smooth?: boolean;
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
