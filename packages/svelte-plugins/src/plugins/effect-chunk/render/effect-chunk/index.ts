import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import { BaseSvelteRenderPlugin, createElement, createTypeOfSlot } from '../../../../base';
import { getChunkConfig, isChunkNode } from './utils';

const Chunk = /*#__PURE__*/ createTypeOfSlot('Chunk');

declare global {
  interface SvelteRenderConfigs {
    'render-chunk': IPluggableConfig<void>;
  }
}

export class EffectChunkRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-chunk';

  match({ node }: SvelteRenderMatchParams) {
    return isChunkNode(node);
  }

  render({ node, renderChildren }: SvelteRenderParams) {
    assert(isChunkNode(node));

    return createElement(Chunk, getChunkConfig(node), renderChildren(node));
  }
}
