import type { IPluggableConfig } from '@fluxdown/types';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import { BaseSvelteRenderPlugin, createElement, createTypeOfSlot } from '../../../../base';

const Element = /*#__PURE__*/ createTypeOfSlot('Element');

declare global {
  interface SvelteRenderConfigs {
    'render-fallback': IPluggableConfig<void>;
  }
}

export class FallbackRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-fallback';

  readonly config = { priority: Infinity };

  match(_params: SvelteRenderMatchParams) {
    return true;
  }

  render({ getProps, node, renderChildren }: SvelteRenderParams) {
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
