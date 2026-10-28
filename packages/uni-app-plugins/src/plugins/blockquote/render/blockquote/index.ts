import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { UniRenderMatchParams, UniRenderParams } from '../../../../base';

import { BaseUniRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

declare global {
  interface UniRenderConfigs {
    'render-blockquote': IPluggableConfig<void>;
  }
}

export class BlockquoteRenderPlugin extends BaseUniRenderPlugin {
  static readonly key = 'render-blockquote';

  match({ node }: UniRenderMatchParams) {
    return isElementWithTag(node, 'blockquote');
  }

  render({ getProps, node, parents, render, renderChildren }: UniRenderParams) {
    assert(isElementWithTag(node, 'blockquote'));

    return Blockquote({ ...getProps(node), current: node, parents, render }, renderChildren(node));
  }
}
