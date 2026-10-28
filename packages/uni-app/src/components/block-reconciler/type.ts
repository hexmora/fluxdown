import type { IRenderPatchItem } from '@fluxdown/core';
import type { IBlockState } from '@fluxdown/types';
import type { IUniRenderPlugin } from '@fluxdown/uni-app-plugins/base';
import type { UniRenderNode } from '@fluxdown/uni-app-plugins/base';
import type { GetPropsFunction } from '@fluxdown/uni-app-plugins/typings';
import type { ElementContent, Parent, Root } from 'hast';
import type { IReactiveState, StateSource } from 'stative';

export interface BlockReconcilerProps {
  block: IBlockState<Root>;

  blocks: StateSource<IBlockState<Root>[]>;

  patches: StateSource<IRenderPatchItem<UniRenderNode>[]>;

  plugins: StateSource<IUniRenderPlugin[]>;
}

export interface RenderNodeParams {
  node: ElementContent;

  parents: Parent[];

  patches: IReactiveState<IRenderPatchItem<UniRenderNode>[]>;

  plugins: IUniRenderPlugin[];

  getProps: GetPropsFunction | undefined | null;
}

export interface BlockEdges {
  first: boolean;

  last: boolean;
}
