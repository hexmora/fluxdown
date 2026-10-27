import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import {
  BaseSvelteRenderPlugin,
  createElement,
  createTypeOfSlot,
  isElementWithTag,
} from '../../../../base';

const Strong = /*#__PURE__*/ createTypeOfSlot('Strong');

declare global {
  interface SvelteRenderConfigs {
    'render-strong': IPluggableConfig<void>;
  }
}

export class StrongRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-strong';

  match({ node }: SvelteRenderMatchParams) {
    return isElementWithTag(node, 'b', 'strong');
  }

  render({ getProps, node, parents, render, renderChildren }: SvelteRenderParams) {
    assert(isElementWithTag(node, 'b', 'strong'));

    return createElement(
      Strong,
      { ...getProps(node), current: node, parents, render },
      renderChildren(node),
    );
  }
}
