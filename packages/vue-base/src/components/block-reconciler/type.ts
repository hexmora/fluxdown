import type { IRenderPatchItem } from '@fluxdown/core';
import type { IBlockState } from '@fluxdown/types';
import type { IVueRenderPlugin } from '@fluxdown/vue-base-plugins/base';
import type { GetPropsFunction } from '@fluxdown/vue-base-plugins/typings';
import type { ElementContent, Parent, Root } from 'hast';
import type { IReactiveState, StateSource } from 'stative';
import type { VNodeChild } from 'vue';

export interface BlockReconcilerProps {
  first?: boolean;

  last?: boolean;

  previous?: IBlockState<Root>;

  block: IBlockState<Root>;

  patches: StateSource<IRenderPatchItem<VNodeChild>[]>;

  plugins: StateSource<IVueRenderPlugin[]>;
}

export interface RenderNodeParams {
  node: ElementContent;

  parents: Parent[];

  patches: IReactiveState<IRenderPatchItem<VNodeChild>[]>;

  plugins: IVueRenderPlugin[];

  getProps: GetPropsFunction | undefined | null;
}
