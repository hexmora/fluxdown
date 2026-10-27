import type { IPluggableConfig } from '@fluxdown/types';

import { isSuffixNode, SUFFIX_DATA_ATTR } from '@fluxdown/core-plugins/plugins/mapper/suffix';
import { assert } from '@fluxdown/utils';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import { BaseSvelteRenderPlugin, createElement, createTypeOfSlot } from '../../../../base';

const Suffix = /*#__PURE__*/ createTypeOfSlot('Suffix');

declare global {
  interface SvelteRenderConfigs {
    'render-suffix': IPluggableConfig<void>;
  }
}

export class EffectSuffixRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-suffix';

  match({ node }: SvelteRenderMatchParams) {
    return isSuffixNode(node);
  }

  render({ node }: SvelteRenderParams) {
    assert(isSuffixNode(node));

    const type = node.properties[SUFFIX_DATA_ATTR];

    if (type !== 'cursor' && type !== 'dot') {
      return null;
    }

    return createElement(Suffix, { type });
  }
}
