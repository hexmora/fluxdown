import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { VueRenderMatchParams, VueRenderParams } from '../../../../base';

import { BaseVueRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

declare global {
  interface VueRenderConfigs {
    'render-blockquote': IPluggableConfig<void>;
  }
}

export class BlockquoteRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-blockquote';

  match({ node }: VueRenderMatchParams) {
    return isElementWithTag(node, 'blockquote');
  }

  render({ getProps, node, parents, render, renderChildren }: VueRenderParams) {
    assert(isElementWithTag(node, 'blockquote'));

    return (
      <Blockquote {...getProps(node)} current={node} parents={parents} render={render}>
        {renderChildren(node)}
      </Blockquote>
    );
  }
}
