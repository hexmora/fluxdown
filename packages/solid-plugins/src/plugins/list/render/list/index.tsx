import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { createMemo } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';
import { hasClassName } from './utils';

const List = /*#__PURE__*/ createTypeOfSlot('List');

declare global {
  interface SolidRenderConfigs {
    'render-list': IPluggableConfig<void>;
  }
}

export class ListRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-list';

  match({ node }: SolidRenderMatchParams) {
    return isElementWithTag(node, 'ol', 'ul');
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isElementWithTag(props.node, 'ol', 'ul'));

      return props.node;
    });

    const type = () => {
      if (node().tagName === 'ol') {
        return 'ordered';
      }

      return hasClassName(node().properties?.className, 'contains-task-list') ? 'task' : 'bullet';
    };

    return (
      <List
        {...props.getProps(node())}
        current={node()}
        parents={props.parents}
        render={props.render}
        type={type()}
      >
        {props.renderChildren()}
      </List>
    );
  }
}
