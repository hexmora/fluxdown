import type { IRenderPatchItem } from '@fluxdown/core';
import type { ILynxRenderPlugin } from '@fluxdown/lynx-plugins/base';
import type { IBlockState } from '@fluxdown/types';
import type { ReactNode } from '@lynx-js/react';
import type { ElementContent, Parent, Root } from 'hast';
import type { IReactiveState, StateSource } from 'stative';

export interface BlockReconcilerProps {
  first?: boolean;

  last?: boolean;

  previous?: IBlockState<Root>;

  block: IBlockState<Root>;

  patches: StateSource<IRenderPatchItem<ReactNode>[]>;

  plugins: StateSource<ILynxRenderPlugin[]>;
}

export interface RenderNodeParams {
  node: ElementContent;

  parents: Parent[];

  patches: IReactiveState<IRenderPatchItem<ReactNode>[]>;

  plugins: ILynxRenderPlugin[];
}
