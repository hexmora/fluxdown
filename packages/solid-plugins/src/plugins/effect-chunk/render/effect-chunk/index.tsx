import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { createMemo } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getChunkConfig, isChunkNode } from './utils';

const Chunk = /*#__PURE__*/ createTypeOfSlot('Chunk');

declare global {
  interface SolidRenderConfigs {
    'render-chunk': IPluggableConfig<void>;
  }
}

export class EffectChunkRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-chunk';

  match({ node }: SolidRenderMatchParams) {
    return isChunkNode(node);
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isChunkNode(props.node));

      return props.node;
    });

    return <Chunk {...getChunkConfig(node())}>{props.renderChildren()}</Chunk>;
  }
}
