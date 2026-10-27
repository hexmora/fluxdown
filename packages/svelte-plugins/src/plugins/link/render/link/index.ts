import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import {
  BaseSvelteRenderPlugin,
  createElement,
  createTypeOfSlot,
  isElementWithTag,
} from '../../../../base';

const Link = /*#__PURE__*/ createTypeOfSlot('Link');

declare global {
  interface SvelteRenderConfigs {
    'render-link': IPluggableConfig<void>;
  }
}

export class LinkRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-link';

  match({ node }: SvelteRenderMatchParams) {
    return isElementWithTag(node, 'a');
  }

  render({ getProps, node, parents, render, renderChildren }: SvelteRenderParams) {
    assert(isElementWithTag(node, 'a'));

    const href = node.properties?.href;

    if (!isString(href) || !href.trim()) {
      return renderChildren(node);
    }

    const { href: _href, title: _title, ...props } = getProps(node);

    const title = isString(node.properties?.title) ? node.properties.title : undefined;

    return createElement(
      Link,
      { ...props, current: node, href, parents, render, title },
      renderChildren(node),
    );
  }
}
