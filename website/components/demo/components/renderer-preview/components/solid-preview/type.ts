import type { BaseBuildConfig, StreamingConfig, Theme } from '@fluxdown/solid';

export interface SolidPreviewProps {
  text: string;

  build?: BaseBuildConfig;

  streaming?: boolean | StreamingConfig;

  theme?: Theme;
}
