import type { SlotBaseProps } from '../../../../../base/slot/type';

export interface RendererProps extends SlotBaseProps {
  tex: string;

  mode?: 'inline' | 'display';
}

export interface Formula {
  src: string;

  width: number;

  height: number;
}
