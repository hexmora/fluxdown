import type { IPluggableConfig } from '@fluxdown/types';
import type { VueRenderMatchParams, VueRenderParams } from '@fluxdown/vue-base-plugins/base';

import { assert } from '@fluxdown/utils';
import { BaseVueRenderPlugin } from '@fluxdown/vue-base-plugins/base';

import { createTypeOfSlot } from '../../../../base';
import { getShadConfig, isShadNode } from './utils';

const Shad = /*#__PURE__*/ createTypeOfSlot('Shad');

declare global {
  interface VueRenderConfigs {
    'render-shad': IPluggableConfig<void>;
  }
}

export class EffectShadRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-shad';

  match({ node }: VueRenderMatchParams) {
    return isShadNode(node);
  }

  render({ node, renderChildren }: VueRenderParams) {
    assert(isShadNode(node));

    return <Shad {...getShadConfig(node)}>{renderChildren(node)}</Shad>;
  }
}
