import type {
  IRenderPatchItem,
  IRenderPlugin,
  IRenderPluginMatchParams,
  IRenderPluginRenderParams,
} from '@fluxdown/core';
import type { IPluggable, IPluggableConfig } from '@fluxdown/types';
import type { Element, ElementContent, Parent } from 'hast';
import type { IReactiveState } from 'stative';

import type { AngularRenderNode } from './node';

export type GetPropsFunction = (node?: Element) => Record<string, unknown>;

declare global {
  interface AngularRenderConfigs {
    'render-blockquote': IPluggableConfig<void>;

    'render-break-line': IPluggableConfig<void>;

    'render-chunk': IPluggableConfig<void>;

    'render-code': IPluggableConfig<void>;

    'render-emphasis': IPluggableConfig<void>;

    'render-fallback': IPluggableConfig<void>;

    'render-heading': IPluggableConfig<void>;

    'render-image': IPluggableConfig<void>;

    'render-link': IPluggableConfig<void>;

    'render-list': IPluggableConfig<void>;

    'render-paragraph': IPluggableConfig<void>;

    'render-patch': IPluggableConfig<void>;

    'render-scale': IPluggableConfig<void>;

    'render-shad': IPluggableConfig<void>;

    'render-strong': IPluggableConfig<void>;

    'render-suffix': IPluggableConfig<void>;

    'render-table': IPluggableConfig<void>;

    'render-table-cell': IPluggableConfig<void>;

    'render-tex': IPluggableConfig<void>;
  }
}

export interface AngularRenderExtraParams {
  getProps: GetPropsFunction;

  patches: IReactiveState<IRenderPatchItem<AngularRenderNode>[]>;

  renderChildren: (node?: Parent) => AngularRenderNode;
}

export type AngularRenderParams = IRenderPluginRenderParams<
  ElementContent,
  Parent,
  AngularRenderNode,
  AngularRenderExtraParams
>;

export interface IAngularRenderPlugin extends IRenderPlugin<
  ElementContent,
  Parent,
  AngularRenderNode,
  AngularRenderExtraParams
> {}

export type IAngularRenderPluggable<O = unknown> = IPluggable<IAngularRenderPlugin, O>;

export type AngularRenderMatchParams = IRenderPluginMatchParams<ElementContent, Parent>;
