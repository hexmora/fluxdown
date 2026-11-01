import type {
  IRenderPatchItem,
  IRenderPlugin,
  IRenderPluginMatchParams,
  IRenderPluginRenderParams,
} from '@fluxdown/core';
import type { IPluggable } from '@fluxdown/types';
import type { ElementContent, Parent } from 'hast';
import type { IReactiveState } from 'stative';

import type { GetPropsFunction, UniRenderNode } from '../../typings/render';

export interface UniRenderExtraParams {
  getProps: GetPropsFunction;

  patches: IReactiveState<IRenderPatchItem<UniRenderNode>[]>;

  renderChildren: (node?: Parent) => UniRenderNode[];
}

export type UniRenderParams = IRenderPluginRenderParams<
  ElementContent,
  Parent,
  UniRenderNode,
  UniRenderExtraParams
>;

export interface IUniRenderPlugin extends IRenderPlugin<
  ElementContent,
  Parent,
  UniRenderNode,
  UniRenderExtraParams
> {}

export type IUniRenderPluggable<O = unknown> = IPluggable<IUniRenderPlugin, O>;

export type UniRenderMatchParams = IRenderPluginMatchParams<ElementContent, Parent>;
