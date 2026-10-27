import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import {
  BaseSvelteRenderPlugin,
  createElement,
  createTypeOfSlot,
  isElementWithTag,
} from '../../../../base';

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

declare global {
  interface SvelteRenderConfigs {
    'render-paragraph': IPluggableConfig<void>;
  }
}

export class ParagraphRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-paragraph';

  match({ node }: SvelteRenderMatchParams) {
    return isElementWithTag(node, 'p');
  }

  render({ getProps, node, parents, render, renderChildren }: SvelteRenderParams) {
    assert(isElementWithTag(node, 'p'));

    if (node.children.length === 0) {
      return null;
    }

    return createElement(
      Paragraph,
      { ...getProps(node), current: node, parents, render },
      renderChildren(node),
    );
  }
}
