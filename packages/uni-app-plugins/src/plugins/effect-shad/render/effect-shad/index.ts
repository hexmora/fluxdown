import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { UniRenderMatchParams, UniRenderParams } from '../../../../base';

import { BaseUniRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getShadConfig, isShadNode } from './utils';

const Shad = /*#__PURE__*/ createTypeOfSlot('Shad');

declare global {
  interface UniRenderConfigs {
    'render-shad': IPluggableConfig<void>;
  }
}

export class EffectShadRenderPlugin extends BaseUniRenderPlugin {
  static readonly key = 'render-shad';

  match({ node }: UniRenderMatchParams) {
    return isShadNode(node);
  }

  render({ node, renderChildren }: UniRenderParams) {
    assert(isShadNode(node));

    return Shad({ ...getShadConfig(node) }, renderChildren(node));
  }
}
