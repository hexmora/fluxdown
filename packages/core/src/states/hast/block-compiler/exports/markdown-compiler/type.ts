import type { IRehypePlugin, IRemarkPlugin } from '@fluxdown/types';

export interface MarkdownCompilerInputs {
  text: string;

  remarks?: IRemarkPlugin[];

  rehypes?: IRehypePlugin[];

  idPrefix?: string;
}
