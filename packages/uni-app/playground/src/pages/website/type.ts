import type { BaseBuildConfig, StreamingConfig } from '@fluxdown/uni-app';

export interface PreviewData {
  text: string;

  options: string;

  dark: boolean;

  cycle: number;
}

export interface PreviewOptions {
  streaming?: boolean | StreamingConfig;

  build?: BaseBuildConfig;
}
