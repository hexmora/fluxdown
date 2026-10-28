import type { IPluggableConfig } from '@fluxdown/types';

import { SCALE_DATA_ATTR, SCALE_WORD_VALUE } from '@fluxdown/core-plugins/plugins/mapper/scale';
import { assert } from '@fluxdown/utils';

import type { VueRenderMatchParams, VueRenderParams } from '../../../../base';

import { BaseVueRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getScaleConfig, isScaleNode } from './utils';

const Scale = /*#__PURE__*/ createTypeOfSlot('Scale');

const ScaleWord = /*#__PURE__*/ createTypeOfSlot('ScaleWord');

declare global {
  interface VueRenderConfigs {
    'render-scale': IPluggableConfig<void>;
  }
}

export class EffectScaleRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-scale';

  match({ node }: VueRenderMatchParams) {
    return isScaleNode(node);
  }

  render({ node, renderChildren }: VueRenderParams) {
    assert(isScaleNode(node));

    const children = renderChildren(node);

    if (node.properties[SCALE_DATA_ATTR] === SCALE_WORD_VALUE) {
      return <ScaleWord>{children}</ScaleWord>;
    }

    return (
      <Scale {...getScaleConfig(node)}>
        {Array.isArray(children) && children.length === 1 ? children[0] : children}
      </Scale>
    );
  }
}
