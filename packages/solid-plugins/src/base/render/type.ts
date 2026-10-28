import type {
  IRenderPatchItem,
  IRenderPlugin,
  IRenderPluginMatchParams,
  IRenderPluginRenderParams,
} from '@fluxdown/core';
import type { IPluggable } from '@fluxdown/types';
import type { ElementContent, Parent } from 'hast';
import type { Accessor, JSX } from 'solid-js';
import type { IReactiveState } from 'stative';

import type { GetPropsFunction } from '../../typings/render';

export interface SolidRenderExtraParams {
  getProps: GetPropsFunction;

  patches: IReactiveState<IRenderPatchItem<JSX.Element>[]>;

  render: (node: ElementContent | Accessor<ElementContent>) => JSX.Element;

  renderChildren: (node?: Parent | Accessor<Parent>) => JSX.Element;
}

export type SolidRenderParams = IRenderPluginRenderParams<
  ElementContent,
  Parent,
  JSX.Element,
  SolidRenderExtraParams
>;

export interface ISolidRenderPlugin extends IRenderPlugin<
  ElementContent,
  Parent,
  JSX.Element,
  SolidRenderExtraParams
> {}

export type ISolidRenderPluggable<O = unknown> = IPluggable<ISolidRenderPlugin, O>;

export type SolidRenderMatchParams = IRenderPluginMatchParams<ElementContent, Parent>;
