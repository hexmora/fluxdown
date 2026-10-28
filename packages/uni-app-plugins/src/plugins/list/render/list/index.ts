import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { UniRenderMatchParams, UniRenderParams } from '../../../../base';

import { BaseUniRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';
import { hasClassName } from './utils';

const List = /*#__PURE__*/ createTypeOfSlot('List');

declare global {
  interface UniRenderConfigs {
    'render-list': IPluggableConfig<void>;
  }
}

export class ListRenderPlugin extends BaseUniRenderPlugin {
  static readonly key = 'render-list';

  match({ node }: UniRenderMatchParams) {
    return isElementWithTag(node, 'ol', 'ul');
  }

  render({ getProps, node, parents, render, renderChildren }: UniRenderParams) {
    assert(isElementWithTag(node, 'ol', 'ul'));

    return List(
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
