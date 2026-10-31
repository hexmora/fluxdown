import type { BaseBuildConfig, StreamingConfig, Theme } from '@fluxdown/svelte';

export interface SveltePreviewProps {
  text: string;

  build?: BaseBuildConfig;

  streaming?: boolean | StreamingConfig;

  theme?: Theme;
}
