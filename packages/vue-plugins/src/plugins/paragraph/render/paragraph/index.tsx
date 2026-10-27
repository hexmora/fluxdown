import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { VueRenderMatchParams, VueRenderParams } from '../../../../base';

import { BaseVueRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

declare global {
  interface VueRenderConfigs {
    'render-paragraph': IPluggableConfig<void>;
  }
}

export class ParagraphRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-paragraph';

  match({ node }: VueRenderMatchParams) {
    return isElementWithTag(node, 'p');
  }

  render({ getProps, node, parents, render, renderChildren }: VueRenderParams) {
    assert(isElementWithTag(node, 'p'));

    if (node.children.length === 0) {
      return null;
    }

    return (
      <Paragraph {...getProps(node)} current={node} parents={parents} render={render}>
        {renderChildren(node)}
      </Paragraph>
    );
  }
}
