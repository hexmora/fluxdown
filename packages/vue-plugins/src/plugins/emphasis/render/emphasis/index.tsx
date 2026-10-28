import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { VueRenderMatchParams, VueRenderParams } from '../../../../base';

import { BaseVueRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Emphasis = /*#__PURE__*/ createTypeOfSlot('Emphasis');

declare global {
  interface VueRenderConfigs {
    'render-emphasis': IPluggableConfig<void>;
  }
}

export class EmphasisRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-emphasis';

  match({ node }: VueRenderMatchParams) {
    return isElementWithTag(node, 'em');
  }

  render({ getProps, node, parents, render, renderChildren }: VueRenderParams) {
    assert(isElementWithTag(node, 'em'));

    return (
      <Emphasis {...getProps(node)} current={node} parents={parents} render={render}>
        {renderChildren(node)}
      </Emphasis>
    );
  }
}
