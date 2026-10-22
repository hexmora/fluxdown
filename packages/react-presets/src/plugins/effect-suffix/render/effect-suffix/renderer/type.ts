import type { SuffixType } from '@fluxdown/core-presets/plugins/mapper/suffix';
import type { ReactNode } from 'react';

export interface SuffixRendererProps {
  type: SuffixType;

  children?: ReactNode;
}
