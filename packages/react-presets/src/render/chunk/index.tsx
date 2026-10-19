import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactRenderMatchParams, ReactRenderParams } from '../../base';

import { BaseReactRenderPlugin } from '../../base';
import { ChunkRenderer } from './renderer';
import { getChunkConfig, isChunkNode } from './utils';

declare global {
  interface RenderConfigs {
    'render-chunk': IPluggableConfig<void>;
  }
}

export class ChunkRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-chunk';

  match({ node }: ReactRenderMatchParams) {
    return isChunkNode(node);
  }

  render({ node, renderChildren }: ReactRenderParams) {
    assert(isChunkNode(node));

    return <ChunkRenderer {...getChunkConfig(node)}>{renderChildren(node)}</ChunkRenderer>;
  }
}
