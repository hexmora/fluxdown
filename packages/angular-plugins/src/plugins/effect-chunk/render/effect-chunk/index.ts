import type {
  AngularRenderMatchParams,
  AngularRenderParams,
} from '@fluxdown/angular-plugins/typings';

import { BaseAngularRenderPlugin, createTypeOfSlot } from '@fluxdown/angular-plugins/base';
import { assert } from '@fluxdown/utils';

import { getChunkConfig, isChunkNode } from './utils';

const Chunk = /*#__PURE__*/ createTypeOfSlot('Chunk');

export class EffectChunkRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-chunk';

  match({ node }: AngularRenderMatchParams) {
    return isChunkNode(node);
  }

  render({ node, renderChildren }: AngularRenderParams) {
    assert(isChunkNode(node));

    const config = getChunkConfig(node);

    return Chunk({
      ...config,
      key: config.start,
      children: renderChildren(node),
    });
  }
}
