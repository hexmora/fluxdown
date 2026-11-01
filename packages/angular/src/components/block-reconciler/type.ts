import type {
  AngularRenderNode,
  GetPropsFunction,
  IAngularRenderPlugin,
} from '@fluxdown/angular-plugins/typings';
import type { IRenderPatchItem } from '@fluxdown/core';
import type { IBlockState } from '@fluxdown/types';
import type { ElementContent, Parent, Root } from 'hast';
import type { IReactiveState, StateSource } from 'stative';

export interface BlockReconcilerProps {
  block: IBlockState<Root>;

  patches: StateSource<IRenderPatchItem<AngularRenderNode>[]>;

  plugins: StateSource<IAngularRenderPlugin[]>;
}

export interface BlockTemplateContext {
  $implicit: BlockReconcilerProps;
}

export interface RenderNodeParams {
  node: ElementContent;

  parents: Parent[];

  patches: IReactiveState<IRenderPatchItem<AngularRenderNode>[]>;

  plugins: IAngularRenderPlugin[];

  getProps: GetPropsFunction | undefined | null;
}
