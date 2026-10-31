import type { IPluggableConfig } from '@fluxdown/types';

import { SCALE_DATA_ATTR, SCALE_WORD_VALUE } from '@fluxdown/core-plugins/plugins/mapper/scale';
import { assert } from '@fluxdown/utils';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import { BaseSvelteRenderPlugin, createElement, createTypeOfSlot } from '../../../../base';
import { getScaleConfig, isScaleNode } from './utils';

const Scale = /*#__PURE__*/ createTypeOfSlot('Scale');

const ScaleWord = /*#__PURE__*/ createTypeOfSlot('ScaleWord');

declare global {
  interface SvelteRenderConfigs {
    'render-scale': IPluggableConfig<void>;
  }
}

export class EffectScaleRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-scale';

  match({ node }: SvelteRenderMatchParams) {
    return isScaleNode(node);
  }

  render({ node, renderChildren }: SvelteRenderParams) {
    assert(isScaleNode(node));

    const children = renderChildren(node);

    if (node.properties[SCALE_DATA_ATTR] === SCALE_WORD_VALUE) {
      return createElement(ScaleWord, null, children);
    }

    return createElement(Scale, getScaleConfig(node), children);
  }
}
