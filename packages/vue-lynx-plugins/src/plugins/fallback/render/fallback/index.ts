import type { IPluggableConfig } from '@fluxdown/types';
import type { VueRenderMatchParams, VueRenderParams } from '@fluxdown/vue-base-plugins/base';

import { BaseVueRenderPlugin, isHastElement } from '@fluxdown/vue-base-plugins/base';
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

  render({ getProps, node, parents, render, renderChildren }: VueRenderParams) {
    if (node.type === 'text') {
      const parent = parents.at(-1);

      const inline =
        parent &&
        isHastElement(parent) &&
        [
          'p',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'li',
          'td',
          'th',
          'span',
          'a',
          'strong',
          'em',
          'code',
          'del',
        ].includes(parent.tagName);

      if (inline) {
        return node.value;
      }

      return node.value.trim() ? h('text', null, node.value) : null;
    }

    if (node.type !== 'element') {
      return null;
    }

    return h(
      Element,
      { ...getProps(node), current: node, parents, render, tagName: node.tagName },
      { default: () => renderChildren(node) },
    );
  }
}
