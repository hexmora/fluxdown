import type {
  AngularRenderMatchParams,
  AngularRenderParams,
} from '@fluxdown/angular-plugins/typings';

import {
  BaseAngularRenderPlugin,
  createTypeOfSlot,
  isSafeTagName,
} from '@fluxdown/angular-plugins/base';

const Element = /*#__PURE__*/ createTypeOfSlot('Element');

export class FallbackRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-fallback';

  readonly config = { priority: Infinity };

  match(_params: AngularRenderMatchParams) {
    return true;
  }

  render({ getProps, node, renderChildren }: AngularRenderParams) {
    if (node.type === 'text') {
      return node.value;
    }

    if (node.type !== 'element' || !isSafeTagName(node.tagName)) {
      return null;
    }

    return Element({ ...getProps(node), tagName: node.tagName, children: renderChildren(node) });
  }
}
