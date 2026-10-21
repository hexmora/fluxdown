import type { ReactRenderExtraParams } from '@fluxdown/react-base-presets/base';
import type { IBlockState } from '@fluxdown/types';
import type { Element, ElementContent, Parent, Root } from 'hast';
import type { ReactNode } from 'react';

import { BaseRenderer } from '@fluxdown/core';

import { BlockReconciler } from '../../components';

export class ReactRenderer extends BaseRenderer<
  Root,
  ElementContent,
  Parent,
  ReactNode,
  ReactRenderExtraParams
> {
  protected getProps(_node?: Element): Record<string, unknown> {
    return {};
  }

  protected renderItem(item: IBlockState<Root>): ReactNode {
    const { patches, plugins } = this.inputs;

    return (
      <BlockReconciler
        key={item.meta.value.key}
        block={item}
        patches={patches}
        plugins={plugins}
        getProps={this.getProps}
      />
    );
  }
}
