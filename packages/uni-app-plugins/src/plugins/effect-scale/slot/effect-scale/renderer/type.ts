import type { SlotBaseProps } from '../../../../../base/slot/type';

export interface RendererProps extends SlotBaseProps {
  start: number;

  duration: number;

  from: number;

  blur: number;
}
