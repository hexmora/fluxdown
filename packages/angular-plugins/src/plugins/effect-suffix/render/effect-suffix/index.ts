import type {
  AngularRenderMatchParams,
  AngularRenderParams,
} from '@fluxdown/angular-plugins/typings';

import { BaseAngularRenderPlugin, createTypeOfSlot } from '@fluxdown/angular-plugins/base';
import { isSuffixNode, SUFFIX_DATA_ATTR } from '@fluxdown/core-plugins/plugins/mapper/suffix';
import { assert } from '@fluxdown/utils';

const Suffix = /*#__PURE__*/ createTypeOfSlot('Suffix');

export class EffectSuffixRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-suffix';

  match({ node }: AngularRenderMatchParams) {
    return isSuffixNode(node);
  }

  render({ node }: AngularRenderParams) {
    assert(isSuffixNode(node));

    const type = node.properties[SUFFIX_DATA_ATTR];

    if (type !== 'cursor' && type !== 'dot') {
      return null;
    }

    return Suffix({
      type,
    });
  }
}
