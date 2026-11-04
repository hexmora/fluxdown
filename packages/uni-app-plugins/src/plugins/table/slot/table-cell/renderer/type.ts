import type { SlotBaseProps } from '../../../../../base/slot/type';

export interface RendererProps extends SlotBaseProps {
  tagName: 'td' | 'th';

  align?: 'left' | 'center' | 'right';
}
