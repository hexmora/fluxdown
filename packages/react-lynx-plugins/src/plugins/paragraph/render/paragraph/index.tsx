import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

declare global {
  interface ReactLynxRenderConfigs {
    'render-paragraph': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render, renderChildren }: ReactLynxRenderParams) => {
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

export class ParagraphRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-paragraph';

  match({ node }: ReactLynxRenderMatchParams) {
    return isElementWithTag(node, 'p');
  }

  readonly render = renderNode;
}
