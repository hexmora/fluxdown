import type { SlotBaseProps } from '../../../../../base/slot/type';
import type { UniRenderNode } from '../../../../../typings/render';

export interface RendererProps extends SlotBaseProps {
  rows: UniRenderNode[][];
}
