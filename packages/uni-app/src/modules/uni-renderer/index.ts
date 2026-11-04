import type { IBlockState } from '@fluxdown/types';
import type { UniRenderExtraParams, UniRenderNode } from '@fluxdown/uni-app-plugins/base';
import type { ElementContent, Parent, Root } from 'hast';

import { BaseRenderer } from '@fluxdown/core';

import { BlockReconciler } from '../../components/block-reconciler';

export class UniRenderer extends BaseRenderer<
  Root,
  ElementContent,
  Parent,
  UniRenderNode,
  UniRenderExtraParams
> {
  protected renderItem(block: IBlockState<Root>): UniRenderNode {
    const { patches, plugins, source } = this.inputs;

    return {
      component: BlockReconciler,
      key: block.meta.value.key,
      props: { block, patches, plugins, blocks: source },
    };
  }
}
