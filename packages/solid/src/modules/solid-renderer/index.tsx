import type { SolidRenderExtraParams } from '@fluxdown/solid-plugins/base';
import type { IBlockState } from '@fluxdown/types';
import type { ElementContent, Parent, Root } from 'hast';
import type { JSX } from 'solid-js';

import { BaseRenderer } from '@fluxdown/core';

import type { SolidBlockElement } from './type';

export type * from './type';

export class SolidRenderer extends BaseRenderer<
  Root,
  ElementContent,
  Parent,
  JSX.Element,
  SolidRenderExtraParams
> {
  protected renderItem(item: IBlockState<Root>): JSX.Element {
    const { patches, plugins } = this.inputs;

    const block: SolidBlockElement = {
      key: item.meta.value.key,
      block: item,
      patches,
      plugins,
    };

    // Core shares one result type with inline patches. These internal block
    // descriptors are mounted by RootReconciler under the Solid provider owner.
    return block as unknown as JSX.Element;
  }
}
