import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import {
  BaseSvelteRenderPlugin,
  createElement,
  createTypeOfSlot,
  isElementWithTag,
} from '../../../../base';
import { hasClassName } from './utils';

const List = /*#__PURE__*/ createTypeOfSlot('List');

declare global {
  interface SvelteRenderConfigs {
    'render-list': IPluggableConfig<void>;
  }
}

export class ListRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-list';

  match({ node }: SvelteRenderMatchParams) {
    return isElementWithTag(node, 'ol', 'ul');
  }

  render({ getProps, node, parents, render, renderChildren }: SvelteRenderParams) {
    assert(isElementWithTag(node, 'ol', 'ul'));

    return createElement(
      List,
      {
        ...getProps(node),
        current: node,
        parents,
        render,
        type:
          node.tagName === 'ol'
            ? 'ordered'
            : hasClassName(node.properties?.className, 'contains-task-list')
              ? 'task'
              : 'bullet',
      },
      renderChildren(node),
    );
  }
}
