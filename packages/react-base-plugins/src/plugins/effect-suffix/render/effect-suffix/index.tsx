import type { IPluggableConfig } from '@fluxdown/types';

import { isSuffixNode, SUFFIX_DATA_ATTR } from '@fluxdown/core-plugins/plugins/mapper/suffix';
import { assert } from '@fluxdown/utils';

import type { ReactRenderMatchParams, ReactRenderParams } from '../../../../base';

import { BaseReactRenderPlugin, createTypeOfSlot } from '../../../../base';

const Suffix = /*#__PURE__*/ createTypeOfSlot('Suffix');

declare global {
  interface RenderConfigs {
    'render-suffix': IPluggableConfig<void>;
  }
}

export class EffectSuffixRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-suffix';

  match({ node }: ReactRenderMatchParams) {
    return isSuffixNode(node);
  }

  render({ node }: ReactRenderParams) {
    assert(isSuffixNode(node));

    const type = node.properties[SUFFIX_DATA_ATTR];

    if (type !== 'cursor' && type !== 'dot') {
      return null;
    }

    return <Suffix type={type} />;
  }
}
