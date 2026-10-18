import type { SuffixType } from '@fluxdown/core-presets/mapper';
import type { ReactNode } from 'react';

export interface SuffixRendererProps {
  type: SuffixType;

  children?: ReactNode;
}
