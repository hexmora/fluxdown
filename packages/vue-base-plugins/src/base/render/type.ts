import type {
  IRenderPatchItem,
  IRenderPlugin,
  IRenderPluginMatchParams,
  IRenderPluginRenderParams,
} from '@fluxdown/core';
import type { IPluggable } from '@fluxdown/types';
import type { ElementContent, Parent } from 'hast';
import type { IReactiveState } from 'stative';
import type { VNodeChild } from 'vue';

import type { GetPropsFunction } from '../../typings/render';

export interface VueRenderExtraParams {
  getProps: GetPropsFunction;

  patches: IReactiveState<IRenderPatchItem<VNodeChild>[]>;

  renderChildren: (node?: Parent) => VNodeChild;
}

export type VueRenderParams = IRenderPluginRenderParams<
  ElementContent,
  Parent,
  VNodeChild,
  VueRenderExtraParams
>;

export interface IVueRenderPlugin extends IRenderPlugin<
  ElementContent,
  Parent,
  VNodeChild,
  VueRenderExtraParams
> {}

export type IVueRenderPluggable<O = unknown> = IPluggable<IVueRenderPlugin, O>;

export type VueRenderMatchParams = IRenderPluginMatchParams<ElementContent, Parent>;
