import type { Element, ElementContent } from 'hast';

import type { SlotBaseProps } from '../../../../../base/slot/type';
import type { UniRenderNode } from '../../../../../typings/render';

export interface RendererProps extends SlotBaseProps {
  type: 'bullet' | 'ordered' | 'task';

  current: Element;

  render: (node: ElementContent) => UniRenderNode;
}
