import type { SlotBaseProps } from '../../../../../base/slot/type';
import type { UniRenderNode } from '../../../../../typings/render';

export interface RendererProps extends SlotBaseProps {
  leading: UniRenderNode;

  active: UniRenderNode;

  isActive: boolean;

  maskWidth: number;

  offset?: number;
}
