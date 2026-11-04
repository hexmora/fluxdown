import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';
import { hasClassName } from './utils';

const List = /*#__PURE__*/ createTypeOfSlot('List');

declare global {
  interface ReactLynxRenderConfigs {
    'render-list': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render, renderChildren }: ReactLynxRenderParams) => {
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
};

export class ListRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-list';

  match({ node }: ReactLynxRenderMatchParams) {
    return isElementWithTag(node, 'ol', 'ul');
  }

  readonly render = renderNode;
}
