import type { ReactNode } from 'react';

export type StreamingPreviewProps = {
  label: string;

  reducedMotion: boolean | null;

  playing: boolean;

  children: ReactNode;
};
