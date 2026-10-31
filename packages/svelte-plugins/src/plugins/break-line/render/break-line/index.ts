import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import {
  BaseSvelteRenderPlugin,
  createElement,
  createTypeOfSlot,
  isElementWithTag,
} from '../../../../base';

const BreakLine = /*#__PURE__*/ createTypeOfSlot('BreakLine');

declare global {
  interface SvelteRenderConfigs {
    'render-break-line': IPluggableConfig<void>;
  }
}

export class BreakLineRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-break-line';

  match({ node }: SvelteRenderMatchParams) {
    return isElementWithTag(node, 'br');
  }

  render({ getProps, node }: SvelteRenderParams) {
    assert(isElementWithTag(node, 'br'));

    return createElement(BreakLine, getProps(node));
  }
}
