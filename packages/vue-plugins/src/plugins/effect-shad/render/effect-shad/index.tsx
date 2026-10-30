import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { VueRenderMatchParams, VueRenderParams } from '../../../../base';

import { BaseVueRenderPlugin, createTypeOfSlot } from '../../../../base';
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
