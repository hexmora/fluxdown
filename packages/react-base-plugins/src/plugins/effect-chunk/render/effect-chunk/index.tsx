import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactRenderMatchParams, ReactRenderParams } from '../../../../base';

import { BaseReactRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getChunkConfig, isChunkNode } from './utils';

const Chunk = /*#__PURE__*/ createTypeOfSlot('Chunk');

declare global {
  interface RenderConfigs {
    'render-chunk': IPluggableConfig<void>;
  }
}

export class EffectChunkRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-chunk';

  match({ node }: ReactRenderMatchParams) {
    return isChunkNode(node);
  }

  render({ node, renderChildren }: ReactRenderParams) {
    assert(isChunkNode(node));

    return <Chunk {...getChunkConfig(node)}>{renderChildren(node)}</Chunk>;
  }
}
