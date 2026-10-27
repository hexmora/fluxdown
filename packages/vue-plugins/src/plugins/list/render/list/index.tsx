import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { VueRenderMatchParams, VueRenderParams } from '../../../../base';

import { BaseVueRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';
import { hasClassName } from './utils';

const List = /*#__PURE__*/ createTypeOfSlot('List');

declare global {
  interface VueRenderConfigs {
    'render-list': IPluggableConfig<void>;
  }
}

export class ListRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-list';

  match({ node }: VueRenderMatchParams) {
    return isElementWithTag(node, 'ol', 'ul');
  }

  render({ getProps, node, parents, render, renderChildren }: VueRenderParams) {
    assert(isElementWithTag(node, 'ol', 'ul'));

    return (
      <List
        {...getProps(node)}
        current={node}
        parents={parents}
        render={render}
        type={
          node.tagName === 'ol'
            ? 'ordered'
            : hasClassName(node.properties?.className, 'contains-task-list')
              ? 'task'
              : 'bullet'
        }
      >
        {renderChildren(node)}
      </List>
    );
  }
}
