import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { LynxRenderMatchParams, LynxRenderParams } from '../../../../base';

import { BaseLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

declare global {
  interface LynxRenderConfigs {
    'render-paragraph': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render, renderChildren }: LynxRenderParams) => {
  assert(isElementWithTag(node, 'p'));

  if (node.children.length === 0) {
    return null;
  }

  return (
    <Paragraph {...getProps(node)} current={node} parents={parents} render={render}>
      {renderChildren(node)}
    </Paragraph>
  );
};

export class ParagraphRenderPlugin extends BaseLynxRenderPlugin {
  static readonly key = 'render-paragraph';

  match({ node }: LynxRenderMatchParams) {
    return isElementWithTag(node, 'p');
  }

  readonly render = renderNode;
}
