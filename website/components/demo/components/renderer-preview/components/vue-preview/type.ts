import type { BaseBuildConfig, StreamingConfig, Theme } from '@fluxdown/vue';

export interface VuePreviewProps {
  text: string;

  build?: BaseBuildConfig;

  streaming?: boolean | StreamingConfig;

  theme?: Theme;
}
