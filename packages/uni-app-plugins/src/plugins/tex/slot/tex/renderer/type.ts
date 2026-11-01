import type { SlotBaseProps } from '../../../../../base/slot/type';

export interface RendererProps extends SlotBaseProps {
  tex: string;

  mode?: 'display' | 'inline';
}
