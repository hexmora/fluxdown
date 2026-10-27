import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { LynxRenderMatchParams, LynxRenderParams } from '../../../../base';

import { BaseLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

declare global {
  interface LynxRenderConfigs {
    'render-blockquote': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render, renderChildren }: LynxRenderParams) => {
  assert(isElementWithTag(node, 'blockquote'));

  return (
    <Blockquote {...getProps(node)} current={node} parents={parents} render={render}>
      {renderChildren(node)}
    </Blockquote>
  );
};

export class BlockquoteRenderPlugin extends BaseLynxRenderPlugin {
  static readonly key = 'render-blockquote';

  match({ node }: LynxRenderMatchParams) {
    return isElementWithTag(node, 'blockquote');
  }

  readonly render = renderNode;
}
