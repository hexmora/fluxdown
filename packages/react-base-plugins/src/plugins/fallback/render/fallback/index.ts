import type { IPluggableConfig } from '@fluxdown/types';

import { createElement } from 'react';

import type { ReactRenderMatchParams, ReactRenderParams } from '../../../../base';

import { BaseReactRenderPlugin, createTypeOfSlot, isHastElement } from '../../../../base';

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

  render({ getProps, node, parents, renderChildren }: ReactRenderParams) {
    if (node.type === 'text') {
      const parent = parents.at(-1);

      if (
        parent &&
        isHastElement(parent) &&
        /^(?:table|thead|tbody|tfoot|tr|colgroup)$/.test(parent.tagName) &&
        /^\s*$/.test(node.value)
      ) {
        return null;
      }

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
