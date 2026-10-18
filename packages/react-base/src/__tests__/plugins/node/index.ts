import type { NodeProps } from '@fluxdown/react-base-presets/base';

import { SCALE_DATA_ATTR, SHAD_DATA_ATTR } from '@fluxdown/core-presets/mapper';
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
      const testID = current.properties?.[SHAD_DATA_ATTR]
        ? 'shad-host'
        : current.properties?.[SCALE_DATA_ATTR]
          ? 'scale-host'
          : undefined;

      return createElement(current.tagName, { 'data-testid': testID }, renderChildren());
    }

    return null;
  };
}
