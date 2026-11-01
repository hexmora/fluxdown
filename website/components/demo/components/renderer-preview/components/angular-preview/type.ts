import type { BaseBuildConfig, StreamingConfig, Theme } from '@fluxdown/angular';

export interface AngularPreviewProps {
  text: string;

  build?: BaseBuildConfig;

  streaming?: boolean | StreamingConfig;

  theme?: Theme;
}
