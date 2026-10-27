import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import {
  BaseSvelteRenderPlugin,
  createElement,
  createTypeOfSlot,
  isElementWithTag,
} from '../../../../base';

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

declare global {
  interface SvelteRenderConfigs {
    'render-blockquote': IPluggableConfig<void>;
  }
}

export class BlockquoteRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-blockquote';

  match({ node }: SvelteRenderMatchParams) {
    return isElementWithTag(node, 'blockquote');
  }

  render({ getProps, node, parents, render, renderChildren }: SvelteRenderParams) {
    assert(isElementWithTag(node, 'blockquote'));

    return createElement(
      Blockquote,
      { ...getProps(node), current: node, parents, render },
      renderChildren(node),
    );
  }
}
