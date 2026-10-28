import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { UniRenderMatchParams, UniRenderParams } from '../../../../base';

import { BaseUniRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Strong = /*#__PURE__*/ createTypeOfSlot('Strong');

declare global {
  interface UniRenderConfigs {
    'render-strong': IPluggableConfig<void>;
  }
}

export class StrongRenderPlugin extends BaseUniRenderPlugin {
  static readonly key = 'render-strong';

  match({ node }: UniRenderMatchParams) {
    return isElementWithTag(node, 'b', 'strong');
  }

  render({ getProps, node, parents, render, renderChildren }: UniRenderParams) {
    assert(isElementWithTag(node, 'b', 'strong'));

    return Strong({ ...getProps(node), current: node, parents, render }, renderChildren(node));
  }
}
