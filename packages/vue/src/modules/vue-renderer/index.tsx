import type { IBlockState } from '@fluxdown/types';
import type { VueRenderExtraParams } from '@fluxdown/vue-plugins/base';
import type { ElementContent, Parent, Root } from 'hast';
import type { VNodeChild } from 'vue';

import { BaseRenderer } from '@fluxdown/core';

import { BlockReconciler } from '../../components';

export class VueRenderer extends BaseRenderer<
  Root,
  ElementContent,
  Parent,
  VNodeChild,
  VueRenderExtraParams
> {
  protected renderItem(item: IBlockState<Root>): VNodeChild {
    const { patches, plugins } = this.inputs;

    return (
      <BlockReconciler key={item.meta.value.key} block={item} patches={patches} plugins={plugins} />
    );
  }
}
