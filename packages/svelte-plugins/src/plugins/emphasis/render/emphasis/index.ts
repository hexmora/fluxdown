import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import {
  BaseSvelteRenderPlugin,
  createElement,
  createTypeOfSlot,
  isElementWithTag,
} from '../../../../base';

const Emphasis = /*#__PURE__*/ createTypeOfSlot('Emphasis');

declare global {
  interface SvelteRenderConfigs {
    'render-emphasis': IPluggableConfig<void>;
  }
}

export class EmphasisRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-emphasis';

  match({ node }: SvelteRenderMatchParams) {
    return isElementWithTag(node, 'em');
  }

  render({ getProps, node, parents, render, renderChildren }: SvelteRenderParams) {
    assert(isElementWithTag(node, 'em'));

    return createElement(
      Emphasis,
      { ...getProps(node), current: node, parents, render },
      renderChildren(node),
    );
  }
}
