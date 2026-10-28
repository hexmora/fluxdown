import type { IRenderPatchItem } from '@fluxdown/core';
import type { ISolidRenderPlugin } from '@fluxdown/solid-plugins/base';
import type { GetPropsFunction } from '@fluxdown/solid-plugins/typings';
import type { IBlockState } from '@fluxdown/types';
import type { ElementContent, Parent, Root } from 'hast';
import type { JSX } from 'solid-js';
import type { IReactiveState, StateSource } from 'stative';

export interface BlockReconcilerProps {
  block: IBlockState<Root>;

  patches: StateSource<IRenderPatchItem<JSX.Element>[]>;

  plugins: StateSource<ISolidRenderPlugin[]>;
}

export interface RenderNodeParams {
  node: ElementContent | undefined;

  parents: Parent[];

  patches: IReactiveState<IRenderPatchItem<JSX.Element>[]>;

  plugins: ISolidRenderPlugin[];

  getProps: GetPropsFunction | undefined | null;
}

export interface RenderChildrenParams extends Omit<RenderNodeParams, 'node'> {
  node: Parent | undefined;
}
