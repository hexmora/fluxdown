import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { VueRenderMatchParams, VueRenderParams } from '../../../../base';

import { BaseVueRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getChunkConfig, isChunkNode } from './utils';

const Chunk = /*#__PURE__*/ createTypeOfSlot('Chunk');

declare global {
  interface VueRenderConfigs {
    'render-chunk': IPluggableConfig<void>;
  }
}

export class EffectChunkRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-chunk';

  match({ node }: VueRenderMatchParams) {
    return isChunkNode(node);
  }

  render({ node, renderChildren }: VueRenderParams) {
    assert(isChunkNode(node));

    return <Chunk {...getChunkConfig(node)}>{renderChildren(node)}</Chunk>;
  }
}
