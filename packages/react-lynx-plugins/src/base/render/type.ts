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

export interface ReactLynxRenderExtraParams {
  getProps: GetPropsFunction;

  patches: IReactiveState<IRenderPatchItem<ReactNode>[]>;

  renderChildren: (node?: Parent) => ReactNode;
}

export type ReactLynxRenderParams = IRenderPluginRenderParams<
  ElementContent,
  Parent,
  ReactNode,
  ReactLynxRenderExtraParams
>;

export interface IReactLynxRenderPlugin extends IRenderPlugin<
  ElementContent,
  Parent,
  ReactNode,
  ReactLynxRenderExtraParams
> {}

export type IReactLynxRenderPluggable<O = unknown> = IPluggable<IReactLynxRenderPlugin, O>;

export type ReactLynxRenderMatchParams = IRenderPluginMatchParams<ElementContent, Parent>;
