import type { IRenderPatchItem } from '@fluxdown/core';
import type { IReactRenderPlugin, ReactRenderExtraParams } from '@fluxdown/react-base-presets/base';
import type { IBlockState } from '@fluxdown/types';
import type { ElementContent, Parent, Root } from 'hast';
import type { ReactNode } from 'react';
import type { IReactiveState, StateSource } from 'stative';

export interface BlockReconcilerProps {
  getProps: ReactRenderExtraParams['getProps'];

  block: IBlockState<Root>;

  patches: StateSource<IRenderPatchItem<ReactNode>[]>;

  plugins: StateSource<IReactRenderPlugin[]>;
}

export interface RenderNodeParams {
  getProps: ReactRenderExtraParams['getProps'];

  node: ElementContent;

  parents: Parent[];

  patches: IReactiveState<IRenderPatchItem<ReactNode>[]>;

  plugins: IReactRenderPlugin[];
}
