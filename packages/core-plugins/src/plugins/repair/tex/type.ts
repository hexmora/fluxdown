export type TexMode = 'inline' | 'display';

export type TexRender = (source: string, mode: TexMode) => string | null;

export type TexRenderSource = (source: string) => string | null;
