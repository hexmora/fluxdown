import type {
  AngularRenderMatchParams,
  AngularRenderParams,
} from '@fluxdown/angular-plugins/typings';

import {
  BaseAngularRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/angular-plugins/base';
import { assert } from '@fluxdown/utils';

const Strong = /*#__PURE__*/ createTypeOfSlot('Strong');

export class StrongRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-strong';

  match({ node }: AngularRenderMatchParams) {
    return isElementWithTag(node, 'b', 'strong');
  }

  render({ getProps, node, parents, render, renderChildren }: AngularRenderParams) {
    assert(isElementWithTag(node, 'b', 'strong'));

    return Strong({
      ...getProps(node),
      current: node,
      parents,
      render,
      children: renderChildren(node),
    });
  }
}
