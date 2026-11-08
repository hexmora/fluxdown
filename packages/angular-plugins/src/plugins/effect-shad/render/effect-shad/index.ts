import type {
  AngularRenderMatchParams,
  AngularRenderParams,
} from '@fluxdown/angular-plugins/typings';

import { BaseAngularRenderPlugin, createTypeOfSlot } from '@fluxdown/angular-plugins/base';
import { assert } from '@fluxdown/utils';

import { getShadConfig, isShadNode } from './utils';

const Shad = /*#__PURE__*/ createTypeOfSlot('Shad');

export class EffectShadRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-shad';

  match({ node }: AngularRenderMatchParams) {
    return isShadNode(node);
  }

  render({ node, renderChildren }: AngularRenderParams) {
    assert(isShadNode(node));

    const config = getShadConfig(node);

    return Shad({
      ...config,
      key: config.start,
      children: renderChildren(node),
    });
  }
}
