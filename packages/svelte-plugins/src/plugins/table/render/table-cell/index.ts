import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import {
  BaseSvelteRenderPlugin,
  createElement,
  createTypeOfSlot,
  isElementWithTag,
} from '../../../../base';

const TableCell = /*#__PURE__*/ createTypeOfSlot('TableCell');

declare global {
  interface SvelteRenderConfigs {
    'render-table-cell': IPluggableConfig<void>;
  }
}

export class TableCellRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-table-cell';

  match({ node }: SvelteRenderMatchParams) {
    return isElementWithTag(node, 'td', 'th');
  }

  render({ getProps, node, renderChildren }: SvelteRenderParams) {
    assert(isElementWithTag(node, 'td', 'th'));

    const { align: _align, ...props } = getProps(node);

    const align = node.properties?.align;

    return createElement(
      TableCell,
      { ...props, align: isString(align) ? align : undefined, tagName: node.tagName },
      renderChildren(node),
    );
  }
}
