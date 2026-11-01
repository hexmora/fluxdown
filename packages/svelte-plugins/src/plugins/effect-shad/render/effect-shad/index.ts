import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import { BaseSvelteRenderPlugin, createElement, createTypeOfSlot } from '../../../../base';
import { getShadConfig, isShadNode } from './utils';

const Shad = /*#__PURE__*/ createTypeOfSlot('Shad');

declare global {
  interface SvelteRenderConfigs {
    'render-shad': IPluggableConfig<void>;
  }
}

export class EffectShadRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-shad';

  match({ node }: SvelteRenderMatchParams) {
    return isShadNode(node);
  }

  render({ node, renderChildren }: SvelteRenderParams) {
    assert(isShadNode(node));

    return createElement(Shad, getShadConfig(node), renderChildren(node));
  }
}
