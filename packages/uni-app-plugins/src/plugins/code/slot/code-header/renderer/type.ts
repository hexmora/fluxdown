import type { SlotBaseProps } from '../../../../../base/slot/type';
import type { UniRenderNode } from '../../../../../typings/render';

export interface RendererProps extends SlotBaseProps {
  code: string;

  language?: string;

  meta?: string;

  suffix?: UniRenderNode;
}
