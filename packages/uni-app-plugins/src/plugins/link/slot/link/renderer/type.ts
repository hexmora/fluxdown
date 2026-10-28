import type { SlotBaseProps } from '../../../../../base/slot/type';

export interface RendererProps extends SlotBaseProps {
  href: string;

  title?: string;

  onPress?: (href: string) => void;
}
