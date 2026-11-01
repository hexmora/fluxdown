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

import { hasClassName } from './utils';

const List = /*#__PURE__*/ createTypeOfSlot('List');

export class ListRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-list';

  match({ node }: AngularRenderMatchParams) {
    return isElementWithTag(node, 'ol', 'ul');
  }

  render({ getProps, node, parents, render, renderChildren }: AngularRenderParams) {
    assert(isElementWithTag(node, 'ol', 'ul'));

    return List({
      ...getProps(node),
      current: node,
      parents,
      render,
      type:
        node.tagName === 'ol'
          ? 'ordered'
          : hasClassName(node.properties?.className, 'contains-task-list')
            ? 'task'
            : 'bullet',
      children: renderChildren(node),
    });
  }
}
