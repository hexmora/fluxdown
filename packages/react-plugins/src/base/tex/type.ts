import type { TexProps } from '@fluxdown/react-base-plugins/base';

export type TexMode = NonNullable<TexProps['mode']>;

export type TexRender = (source: string, mode: TexMode) => string | null;

export type TexRenderSource = (source: string) => string | null;

export interface TexRenderResult {
  tex: string;

  html: string | null;
}
