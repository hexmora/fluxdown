import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

declare global {
  interface ReactLynxRenderConfigs {
    'render-blockquote': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render, renderChildren }: ReactLynxRenderParams) => {
  assert(isElementWithTag(node, 'blockquote'));

  return (
    <Blockquote {...getProps(node)} current={node} parents={parents} render={render}>
      {renderChildren(node)}
    </Blockquote>
  );
};

export class BlockquoteRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-blockquote';

  match({ node }: ReactLynxRenderMatchParams) {
    return isElementWithTag(node, 'blockquote');
  }

  readonly render = renderNode;
}
