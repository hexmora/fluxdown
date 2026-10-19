import type { ReactNode } from 'react';

export interface ChunkRendererProps {
  children: ReactNode;

  start: number;

  duration: number;
}
