import type {
  AngularRenderMatchParams,
  AngularRenderParams,
} from '@fluxdown/angular-plugins/typings';

import { BaseAngularRenderPlugin, createTypeOfSlot } from '@fluxdown/angular-plugins/base';
import { assert } from '@fluxdown/utils';

import { getHeadingLevel, isHeadingNode } from './utils';

const Heading = /*#__PURE__*/ createTypeOfSlot('Heading');

export class HeadingRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-heading';

  match({ node }: AngularRenderMatchParams) {
    return isHeadingNode(node);
  }

  render({ getProps, node, parents, render, renderChildren }: AngularRenderParams) {
    assert(isHeadingNode(node));

    const level = getHeadingLevel(node.tagName);

    return Heading({
      ...getProps(node),
      current: node,
      level,
      parents,
      render,
      children: renderChildren(node),
    });
  }
}
