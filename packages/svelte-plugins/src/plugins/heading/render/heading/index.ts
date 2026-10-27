import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import { BaseSvelteRenderPlugin, createElement, createTypeOfSlot } from '../../../../base';
import { getHeadingLevel, isHeadingNode } from './utils';

const Heading = /*#__PURE__*/ createTypeOfSlot('Heading');

declare global {
  interface SvelteRenderConfigs {
    'render-heading': IPluggableConfig<void>;
  }
}

export class HeadingRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-heading';

  match({ node }: SvelteRenderMatchParams) {
    return isHeadingNode(node);
  }

  render({ getProps, node, parents, render, renderChildren }: SvelteRenderParams) {
    assert(isHeadingNode(node));

    const level = getHeadingLevel(node.tagName);

    return createElement(
      Heading,
      { ...getProps(node), current: node, level, parents, render },
      renderChildren(node),
    );
  }
}
