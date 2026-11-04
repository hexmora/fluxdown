import type { IPluggableConfig } from '@fluxdown/types';
import type { VueRenderMatchParams, VueRenderParams } from '@fluxdown/vue-base-plugins/base';

import { BaseVueRenderPlugin } from '@fluxdown/vue-base-plugins/base';
import { h } from 'vue';

import { createTypeOfSlot } from '../../../../base';

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
