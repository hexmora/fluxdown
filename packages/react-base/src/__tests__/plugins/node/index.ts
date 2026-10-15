import type { NodeProps } from '@fluxdown/react-base-presets/base';

import { BaseSlotPlugin } from '@fluxdown/react-base-presets/base';
import { createElement } from 'react';

export class MockNodeSlotPlugin extends BaseSlotPlugin<'Node'> {
  static readonly key = 'mock-slot-node';

  readonly type = 'Node';

  readonly Component = ({ current, renderChildren }: NodeProps) => {
    if (current.type === 'text') {
      return current.value;
    }

    if (current.type === 'element') {
      return createElement(current.tagName, null, renderChildren());
    }

    return null;
  };
}
