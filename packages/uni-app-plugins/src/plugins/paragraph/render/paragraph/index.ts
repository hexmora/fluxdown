import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { UniRenderMatchParams, UniRenderParams } from '../../../../base';

import { BaseUniRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

declare global {
  interface UniRenderConfigs {
    'render-paragraph': IPluggableConfig<void>;
  }
}

export class ParagraphRenderPlugin extends BaseUniRenderPlugin {
  static readonly key = 'render-paragraph';

  match({ node }: UniRenderMatchParams) {
    return isElementWithTag(node, 'p');
  }

  render({ getProps, node, parents, render, renderChildren }: UniRenderParams) {
    assert(isElementWithTag(node, 'p'));

    if (node.children.length === 0) {
      return null;
    }

    return Paragraph({ ...getProps(node), current: node, parents, render }, renderChildren(node));
  }
}
