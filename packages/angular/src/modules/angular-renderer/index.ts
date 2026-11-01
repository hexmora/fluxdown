import type { TemplateRef } from '@angular/core';
import type {
  AngularRenderExtraParams,
  AngularRenderNode,
} from '@fluxdown/angular-plugins/typings';
import type { RendererClass } from '@fluxdown/core';
import type { IBlockState } from '@fluxdown/types';
import type { ElementContent, Parent, Root } from 'hast';

import { BaseRenderer } from '@fluxdown/core';

import type { BlockTemplateContext } from '../../components';

export const createAngularRenderer = (
  template: TemplateRef<BlockTemplateContext>,
): RendererClass<Root, ElementContent, Parent, AngularRenderNode, AngularRenderExtraParams> => {
  return class AngularRenderer extends BaseRenderer<
    Root,
    ElementContent,
    Parent,
    AngularRenderNode,
    AngularRenderExtraParams
  > {
    protected renderItem(block: IBlockState<Root>): AngularRenderNode {
      const { patches, plugins } = this.inputs;

      return {
        kind: 'template',
        Template: template,
        context: { $implicit: { block, patches, plugins } },
        key: block.meta.value.key,
      };
    }
  };
};
