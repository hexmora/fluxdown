import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { VueRenderMatchParams, VueRenderParams } from '../../../../base';

import { BaseVueRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Strong = /*#__PURE__*/ createTypeOfSlot('Strong');

declare global {
  interface VueRenderConfigs {
    'render-strong': IPluggableConfig<void>;
  }
}

export class StrongRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-strong';

  match({ node }: VueRenderMatchParams) {
    return isElementWithTag(node, 'b', 'strong');
  }

  render({ getProps, node, parents, render, renderChildren }: VueRenderParams) {
    assert(isElementWithTag(node, 'b', 'strong'));

    return (
      <Strong {...getProps(node)} current={node} parents={parents} render={render}>
        {renderChildren(node)}
      </Strong>
    );
  }
}
