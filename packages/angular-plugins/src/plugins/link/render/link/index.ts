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
import { isString } from 'lodash-es';

const Link = /*#__PURE__*/ createTypeOfSlot('Link');

export class LinkRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-link';

  match({ node }: AngularRenderMatchParams) {
    return isElementWithTag(node, 'a');
  }

  render({ getProps, node, parents, render, renderChildren }: AngularRenderParams) {
    assert(isElementWithTag(node, 'a'));

    const href = node.properties?.href;

    if (!isString(href) || !href.trim()) {
      return renderChildren(node);
    }

    const { href: _href, title: _title, ...props } = getProps(node);

    const title = isString(node.properties?.title) ? node.properties.title : undefined;

    return Link({
      ...props,
      current: node,
      href,
      parents,
      render,
      title,
      children: renderChildren(node),
    });
  }
}
