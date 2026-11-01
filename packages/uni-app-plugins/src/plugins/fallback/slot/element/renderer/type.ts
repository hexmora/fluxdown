import type { SlotBaseProps } from '../../../../../base/slot/type';

export interface RendererProps extends SlotBaseProps {
  tagName: string;

  checked?: boolean;
}
