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

const Emphasis = /*#__PURE__*/ createTypeOfSlot('Emphasis');

export class EmphasisRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-emphasis';

  match({ node }: AngularRenderMatchParams) {
    return isElementWithTag(node, 'em');
  }

  render({ getProps, node, parents, render, renderChildren }: AngularRenderParams) {
    assert(isElementWithTag(node, 'em'));

    return Emphasis({
      ...getProps(node),
      current: node,
      parents,
      render,
      children: renderChildren(node),
    });
  }
}
