import type { IPluggableConfig } from '@fluxdown/types';

import { h } from 'vue';

import type { VueRenderMatchParams, VueRenderParams } from '../../../../base';

import { BaseVueRenderPlugin, createTypeOfSlot } from '../../../../base';

const Element = /*#__PURE__*/ createTypeOfSlot('Element');

declare global {
  interface VueRenderConfigs {
    'render-fallback': IPluggableConfig<void>;
  }
}

export class FallbackRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-fallback';

  readonly config = { priority: Infinity };

  match(_params: VueRenderMatchParams) {
    return true;
  }

  render({ getProps, node, renderChildren }: VueRenderParams) {
    if (node.type === 'text') {
      return node.value;
    }

    if (node.type !== 'element') {
      return null;
    }

    return h(
      Element,
      { ...getProps(node), tagName: node.tagName },
      { default: () => renderChildren(node) },
    );
  }
}
