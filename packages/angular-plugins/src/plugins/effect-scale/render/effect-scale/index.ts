import type {
  AngularRenderMatchParams,
  AngularRenderParams,
} from '@fluxdown/angular-plugins/typings';

import { BaseAngularRenderPlugin, createTypeOfSlot } from '@fluxdown/angular-plugins/base';
import { SCALE_DATA_ATTR, SCALE_WORD_VALUE } from '@fluxdown/core-plugins/plugins/mapper/scale';
import { assert } from '@fluxdown/utils';

import { getScaleConfig, isScaleNode } from './utils';

const Scale = /*#__PURE__*/ createTypeOfSlot('Scale');

const ScaleWord = /*#__PURE__*/ createTypeOfSlot('ScaleWord');

export class EffectScaleRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-scale';

  match({ node }: AngularRenderMatchParams) {
    return isScaleNode(node);
  }

  render({ node, renderChildren }: AngularRenderParams) {
    assert(isScaleNode(node));

    const children = renderChildren(node);

    if (node.properties[SCALE_DATA_ATTR] === SCALE_WORD_VALUE) {
      return ScaleWord({
        children,
      });
    }

    const config = getScaleConfig(node);

    return Scale({
      ...config,
      key: config.start,
      children: Array.isArray(children) && children.length === 1 ? children[0] : children,
    });
  }
}
