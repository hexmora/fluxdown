import type { ReactNode } from 'react';

export interface ScaleWordRendererProps {
  children: ReactNode;
}

export interface ScaleRendererProps extends ScaleWordRendererProps {
  start: number;

  duration: number;

  from: number;

  blur: number;
}
