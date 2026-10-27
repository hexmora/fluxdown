import type { IRenderPatchItem } from '@fluxdown/core';
import type { ISvelteRenderPlugin } from '@fluxdown/svelte-plugins/base';
import type { SvelteNode } from '@fluxdown/svelte-plugins/base';
import type { GetPropsFunction } from '@fluxdown/svelte-plugins/typings';
import type { IBlockState } from '@fluxdown/types';
import type { ElementContent, Parent, Root } from 'hast';
import type { IReactiveState, StateSource } from 'stative';

export interface BlockReconcilerProps {
  block: IBlockState<Root>;

  patches: StateSource<IRenderPatchItem<SvelteNode>[]>;

  plugins: StateSource<ISvelteRenderPlugin[]>;
}

export interface RenderNodeParams {
  node: ElementContent;

  parents: Parent[];

  patches: IReactiveState<IRenderPatchItem<SvelteNode>[]>;

  plugins: ISvelteRenderPlugin[];

  getProps: GetPropsFunction | undefined | null;
}
