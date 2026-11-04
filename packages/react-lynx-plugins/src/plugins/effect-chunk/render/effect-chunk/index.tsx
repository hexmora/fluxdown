import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getChunkConfig, isChunkNode } from './utils';

const Chunk = /*#__PURE__*/ createTypeOfSlot('Chunk');

declare global {
  interface ReactLynxRenderConfigs {
    'render-chunk': IPluggableConfig<void>;
  }
}

const renderNode = ({ node, renderChildren }: ReactLynxRenderParams) => {
  assert(isChunkNode(node));

  return <Chunk {...getChunkConfig(node)}>{renderChildren(node)}</Chunk>;
};

export class EffectChunkRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-chunk';

  match({ node }: ReactLynxRenderMatchParams) {
    return isChunkNode(node);
  }

  readonly render = renderNode;
}
