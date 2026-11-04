import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Link = /*#__PURE__*/ createTypeOfSlot('Link');

declare global {
  interface ReactLynxRenderConfigs {
    'render-link': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render, renderChildren }: ReactLynxRenderParams) => {
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
};

export class LinkRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-link';

  match({ node }: ReactLynxRenderMatchParams) {
    return isElementWithTag(node, 'a');
  }

  readonly render = renderNode;
}
