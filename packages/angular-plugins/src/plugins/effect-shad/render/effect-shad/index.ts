import type {
  AngularRenderMatchParams,
  AngularRenderParams,
} from '@fluxdown/angular-plugins/typings';

import {
  BaseAngularRenderPlugin,
  createTypeOfSlot,
  getTextContent,
  isElementWithTag,
} from '@fluxdown/angular-plugins/base';
import { assert } from '@fluxdown/utils';

import { getShadConfig, isShadNode } from './utils';

const Shad = /*#__PURE__*/ createTypeOfSlot('Shad');

export class EffectShadRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-shad';

  match({ node }: AngularRenderMatchParams) {
    return isShadNode(node);
  }

  render({ node, renderChildren }: AngularRenderParams) {
    assert(isShadNode(node));

    const [leading, active] = node.children;

    assert(leading && isElementWithTag(leading, 'span'));

    assert(active && isElementWithTag(active, 'span'));

    return Shad({
      ...getShadConfig(node),
      active: renderChildren(active),
      isActive: getTextContent(active).length > 0,
      leading: renderChildren(leading),
    });
  }
}
