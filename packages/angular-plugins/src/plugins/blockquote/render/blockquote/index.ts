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

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

export class BlockquoteRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-blockquote';

  match({ node }: AngularRenderMatchParams) {
    return isElementWithTag(node, 'blockquote');
  }

  render({ getProps, node, parents, render, renderChildren }: AngularRenderParams) {
    assert(isElementWithTag(node, 'blockquote'));

    return Blockquote({
      ...getProps(node),
      current: node,
      parents,
      render,
      children: renderChildren(node),
    });
  }
}
