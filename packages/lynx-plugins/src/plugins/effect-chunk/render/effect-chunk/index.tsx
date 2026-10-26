import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { LynxRenderMatchParams, LynxRenderParams } from '../../../../base';

import { BaseLynxRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getChunkConfig, isChunkNode } from './utils';

const Chunk = /*#__PURE__*/ createTypeOfSlot('Chunk');

declare global {
  interface LynxRenderConfigs {
    'render-chunk': IPluggableConfig<void>;
  }
}

const renderNode = ({ node, renderChildren }: LynxRenderParams) => {
  assert(isChunkNode(node));

  return <Chunk {...getChunkConfig(node)}>{renderChildren(node)}</Chunk>;
};

export class EffectChunkRenderPlugin extends BaseLynxRenderPlugin {
  static readonly key = 'render-chunk';

  match({ node }: LynxRenderMatchParams) {
    return isChunkNode(node);
  }

  readonly render = renderNode;
}
