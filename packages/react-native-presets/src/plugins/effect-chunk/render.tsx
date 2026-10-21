import type { ReactRenderMatchParams, ReactRenderParams } from '@fluxdown/react-base-presets/base';
import type { IPluggableConfig } from '@fluxdown/types';

import { BaseReactRenderPlugin } from '@fluxdown/react-base-presets/base';
import { assert } from '@fluxdown/utils';

import type { IPluginItem } from '../../typings';

import { ChunkRenderer } from './renderer';
import { getChunkConfig, isChunkNode } from './utils';

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

    return <ChunkRenderer {...getChunkConfig(node)}>{renderChildren(node)}</ChunkRenderer>;
  }
}

export const EffectChunkPlugin: IPluginItem = { renders: [EffectChunkRenderPlugin] };
