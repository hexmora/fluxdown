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

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

export class ParagraphRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-paragraph';

  match({ node }: AngularRenderMatchParams) {
    return isElementWithTag(node, 'p');
  }

  render({ getProps, node, parents, render, renderChildren }: AngularRenderParams) {
    assert(isElementWithTag(node, 'p'));

    if (node.children.length === 0) {
      return null;
    }

    return Paragraph({
      ...getProps(node),
      current: node,
      parents,
      render,
      children: renderChildren(node),
    });
  }
}
