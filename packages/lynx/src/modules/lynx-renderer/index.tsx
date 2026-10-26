import type { LynxRenderExtraParams } from '@fluxdown/lynx-plugins/base';
import type { IBlockState } from '@fluxdown/types';
import type { ReactNode } from '@lynx-js/react';
import type { ElementContent, Parent, Root } from 'hast';

import { BaseRenderer } from '@fluxdown/core';

import { BlockReconciler } from '../../components';

export class LynxRenderer extends BaseRenderer<
  Root,
  ElementContent,
  Parent,
  ReactNode,
  LynxRenderExtraParams
> {
  protected renderItem(item: IBlockState<Root>): ReactNode {
    const { patches, plugins } = this.inputs;

    return (
      <BlockReconciler key={item.meta.value.key} block={item} patches={patches} plugins={plugins} />
    );
  }
}
