import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

import type { VueRenderMatchParams, VueRenderParams } from '../../../../base';

import { BaseVueRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Link = /*#__PURE__*/ createTypeOfSlot('Link');

declare global {
  interface VueRenderConfigs {
    'render-link': IPluggableConfig<void>;
  }
}

export class LinkRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-link';

  match({ node }: VueRenderMatchParams) {
    return isElementWithTag(node, 'a');
  }

  render({ getProps, node, parents, render, renderChildren }: VueRenderParams) {
    assert(isElementWithTag(node, 'a'));

    const href = node.properties?.href;

    if (!isString(href) || !href.trim()) {
      return renderChildren(node);
    }

    const { href: _href, title: _title, ...props } = getProps(node);

    const title = isString(node.properties?.title) ? node.properties.title : undefined;

    return (
      <Link {...props} current={node} href={href} parents={parents} render={render} title={title}>
        {renderChildren(node)}
      </Link>
    );
  }
}
