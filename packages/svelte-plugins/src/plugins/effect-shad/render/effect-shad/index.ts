import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import {
  BaseSvelteRenderPlugin,
  createElement,
  createTypeOfSlot,
  getTextContent,
  isElementWithTag,
} from '../../../../base';
import { getShadConfig, isShadNode } from './utils';

const Shad = /*#__PURE__*/ createTypeOfSlot('Shad');

declare global {
  interface SvelteRenderConfigs {
    'render-shad': IPluggableConfig<void>;
  }
}

export class EffectShadRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-shad';

  match({ node }: SvelteRenderMatchParams) {
    return isShadNode(node);
  }

  render({ node, renderChildren }: SvelteRenderParams) {
    assert(isShadNode(node));

    const [leading, active] = node.children;

    assert(leading && isElementWithTag(leading, 'span'));

    assert(active && isElementWithTag(active, 'span'));

    return createElement(Shad, {
      ...getShadConfig(node),
      active: renderChildren(active),
      isActive: getTextContent(active).length > 0,
      leading: renderChildren(leading),
    });
  }
}
