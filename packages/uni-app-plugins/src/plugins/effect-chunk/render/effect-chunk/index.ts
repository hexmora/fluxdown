import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { UniRenderMatchParams, UniRenderParams } from '../../../../base';

import { BaseUniRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getChunkConfig, isChunkNode } from './utils';

const Chunk = /*#__PURE__*/ createTypeOfSlot('Chunk');

declare global {
  interface UniRenderConfigs {
    'render-chunk': IPluggableConfig<void>;
  }
}

export class EffectChunkRenderPlugin extends BaseUniRenderPlugin {
  static readonly key = 'render-chunk';

  match({ node }: UniRenderMatchParams) {
    return isChunkNode(node);
  }

  render({ node, renderChildren }: UniRenderParams) {
    assert(isChunkNode(node));

    return Chunk({ ...getChunkConfig(node) }, renderChildren(node));
  }
}
