import type {
  IRenderPatchItem,
  IRenderPlugin,
  IRenderPluginMatchParams,
  IRenderPluginRenderParams,
} from '@fluxdown/core';
import type { IPluggable } from '@fluxdown/types';
import type { ElementContent, Parent } from 'hast';
import type { IReactiveState } from 'stative';

import type { GetPropsFunction } from '../../typings/render';
import type { SvelteNode } from './node';

export interface SvelteRenderExtraParams {
  getProps: GetPropsFunction;

  patches: IReactiveState<IRenderPatchItem<SvelteNode>[]>;

  renderChildren: (node?: Parent) => SvelteNode;
}

export type SvelteRenderParams = IRenderPluginRenderParams<
  ElementContent,
  Parent,
  SvelteNode,
  SvelteRenderExtraParams
>;

export interface ISvelteRenderPlugin extends IRenderPlugin<
  ElementContent,
  Parent,
  SvelteNode,
  SvelteRenderExtraParams
> {}

export type ISvelteRenderPluggable<O = unknown> = IPluggable<ISvelteRenderPlugin, O>;

export type SvelteRenderMatchParams = IRenderPluginMatchParams<ElementContent, Parent>;
