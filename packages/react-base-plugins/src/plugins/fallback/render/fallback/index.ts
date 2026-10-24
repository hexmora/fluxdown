import type { IPluggableConfig } from '@fluxdown/types';

import { createElement } from 'react';

import type { ReactRenderMatchParams, ReactRenderParams } from '../../../../base';

import { BaseReactRenderPlugin, createTypeOfSlot } from '../../../../base';

const Element = /*#__PURE__*/ createTypeOfSlot('Element');

declare global {
  interface RenderConfigs {
    'render-fallback': IPluggableConfig<void>;
  }
}

export class FallbackRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-fallback';

  readonly config = { priority: Infinity };

  match(_params: ReactRenderMatchParams) {
    return true;
  }

  render({ getProps, node, renderChildren }: ReactRenderParams) {
    if (node.type === 'text') {
      return node.value;
    }

    if (node.type !== 'element') {
      return null;
    }

    return createElement(
      Element,
      { ...getProps(node), tagName: node.tagName },
      renderChildren(node),
    );
  }
}
