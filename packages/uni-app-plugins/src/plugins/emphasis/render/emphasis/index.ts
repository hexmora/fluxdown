import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { UniRenderMatchParams, UniRenderParams } from '../../../../base';

import { BaseUniRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Emphasis = /*#__PURE__*/ createTypeOfSlot('Emphasis');

declare global {
  interface UniRenderConfigs {
    'render-emphasis': IPluggableConfig<void>;
  }
}

export class EmphasisRenderPlugin extends BaseUniRenderPlugin {
  static readonly key = 'render-emphasis';

  match({ node }: UniRenderMatchParams) {
    return isElementWithTag(node, 'em');
  }

  render({ getProps, node, parents, render, renderChildren }: UniRenderParams) {
    assert(isElementWithTag(node, 'em'));

    return Emphasis({ ...getProps(node), current: node, parents, render }, renderChildren(node));
  }
}
