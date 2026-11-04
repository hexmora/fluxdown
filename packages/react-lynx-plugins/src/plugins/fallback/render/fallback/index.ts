import type { IPluggableConfig } from '@fluxdown/types';

import { createElement } from '@lynx-js/react';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin, createTypeOfSlot, isHastElement } from '../../../../base';

const Element = /*#__PURE__*/ createTypeOfSlot('Element');

declare global {
  interface ReactLynxRenderConfigs {
    'render-fallback': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render, renderChildren }: ReactLynxRenderParams) => {
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

    return node.value.trim() ? createElement('text', null, node.value) : null;
  }

  if (node.type !== 'element') {
    return null;
  }

  return createElement(
    Element,
    { ...getProps(node), current: node, parents, render, tagName: node.tagName },
    renderChildren(node),
  );
};

export class FallbackRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-fallback';

  readonly config = { priority: Infinity };

  match(_params: ReactLynxRenderMatchParams) {
    return true;
  }

  readonly render = renderNode;
}
