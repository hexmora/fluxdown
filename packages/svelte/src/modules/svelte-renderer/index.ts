import type { SvelteNode, SvelteRenderExtraParams } from '@fluxdown/svelte-plugins/base';
import type { IBlockState } from '@fluxdown/types';
import type { ElementContent, Parent, Root } from 'hast';

import { BaseRenderer } from '@fluxdown/core';
import { createElement } from '@fluxdown/svelte-plugins/base';

import { BlockReconciler } from '../../components/block-reconciler';

export class SvelteRenderer extends BaseRenderer<
  Root,
  ElementContent,
  Parent,
  SvelteNode,
  SvelteRenderExtraParams
> {
  protected renderItem(block: IBlockState<Root>): SvelteNode {
    const { patches, plugins } = this.inputs;

    return createElement(BlockReconciler, { key: block.meta.value.key, block, patches, plugins });
  }
}
