import type {
  IRenderPatchItem,
  IRenderPlugin,
  IRenderPluginMatchParams,
  IRenderPluginRenderParams,
} from '@fluxdown/core';
import type { IPluggable } from '@fluxdown/types';
import type { ReactNode } from '@lynx-js/react';
import type { ElementContent, Parent } from 'hast';
import type { IReactiveState } from 'stative';

import type { GetPropsFunction } from '../../typings/render';

export interface LynxRenderExtraParams {
  getProps: GetPropsFunction;

  patches: IReactiveState<IRenderPatchItem<ReactNode>[]>;

  renderChildren: (node?: Parent) => ReactNode;
}

export type LynxRenderParams = IRenderPluginRenderParams<
  ElementContent,
  Parent,
  ReactNode,
  LynxRenderExtraParams
>;

export interface ILynxRenderPlugin extends IRenderPlugin<
  ElementContent,
  Parent,
  ReactNode,
  LynxRenderExtraParams
> {}

export type ILynxRenderPluggable<O = unknown> = IPluggable<ILynxRenderPlugin, O>;

export type LynxRenderMatchParams = IRenderPluginMatchParams<ElementContent, Parent>;
