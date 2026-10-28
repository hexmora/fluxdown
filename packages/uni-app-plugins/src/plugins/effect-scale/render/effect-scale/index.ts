import type { IPluggableConfig } from '@fluxdown/types';

import { SCALE_DATA_ATTR, SCALE_WORD_VALUE } from '@fluxdown/core-plugins/plugins/mapper/scale';
import { assert } from '@fluxdown/utils';

import type { UniRenderMatchParams, UniRenderParams } from '../../../../base';

import { BaseUniRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getScaleConfig, isScaleNode } from './utils';

const Scale = /*#__PURE__*/ createTypeOfSlot('Scale');

const ScaleWord = /*#__PURE__*/ createTypeOfSlot('ScaleWord');

declare global {
  interface UniRenderConfigs {
    'render-scale': IPluggableConfig<void>;
  }
}

export class EffectScaleRenderPlugin extends BaseUniRenderPlugin {
  static readonly key = 'render-scale';

  match({ node }: UniRenderMatchParams) {
    return isScaleNode(node);
  }

  render({ node, renderChildren }: UniRenderParams) {
    assert(isScaleNode(node));

    const children = renderChildren(node);

    if (node.properties[SCALE_DATA_ATTR] === SCALE_WORD_VALUE) {
      return ScaleWord({}, children);
    }

    return Scale(getScaleConfig(node), children);
  }
}
