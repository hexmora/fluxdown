import type { BlockCompilerConfig } from '@fluxdown/core';

export type PreviewBuild = Partial<Omit<BlockCompilerConfig, 'repairEnding'>>;

export type Renderer = 'react' | 'vue' | 'react-native' | 'lynx' | 'solid' | 'taro';

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
  build?: PreviewBuild;
  dark: boolean;
  cycle?: number;
  reducedMotion?: boolean;
}
