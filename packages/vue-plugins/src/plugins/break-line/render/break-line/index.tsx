import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { VueRenderMatchParams, VueRenderParams } from '../../../../base';

import { BaseVueRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const BreakLine = /*#__PURE__*/ createTypeOfSlot('BreakLine');

declare global {
  interface VueRenderConfigs {
    'render-break-line': IPluggableConfig<void>;
  }
}

export class BreakLineRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-break-line';

  match({ node }: VueRenderMatchParams) {
    return isElementWithTag(node, 'br');
  }

  render({ getProps, node }: VueRenderParams) {
    assert(isElementWithTag(node, 'br'));

    return <BreakLine {...getProps(node)} />;
  }
}
