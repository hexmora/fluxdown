import type { ReactNode } from 'react';

export interface TextColors {
  color: string;
  muted: string;
  accent: string;
}

export interface TextColorProviderProps {
  value: string;
  muted?: string;
  accent?: string;
  children?: ReactNode;
}
