import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { createMemo } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const BreakLine = /*#__PURE__*/ createTypeOfSlot('BreakLine');

declare global {
  interface SolidRenderConfigs {
    'render-break-line': IPluggableConfig<void>;
  }
}

export class BreakLineRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-break-line';

  match({ node }: SolidRenderMatchParams) {
    return isElementWithTag(node, 'br');
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isElementWithTag(props.node, 'br'));

      return props.node;
    });

    return <BreakLine {...props.getProps(node())} />;
  }
}
