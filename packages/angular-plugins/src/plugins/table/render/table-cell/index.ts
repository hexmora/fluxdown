import type {
  AngularRenderMatchParams,
  AngularRenderParams,
} from '@fluxdown/angular-plugins/typings';

import {
  BaseAngularRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/angular-plugins/base';
import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

const TableCell = /*#__PURE__*/ createTypeOfSlot('TableCell');

export class TableCellRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-table-cell';

  match({ node }: AngularRenderMatchParams) {
    return isElementWithTag(node, 'td', 'th');
  }

  render({ getProps, node, renderChildren }: AngularRenderParams) {
    assert(isElementWithTag(node, 'td', 'th'));

    const { align: _align, ...props } = getProps(node);

    const align = node.properties?.align;

    return TableCell({
      ...props,
      align: isString(align) ? align : undefined,
      tagName: node.tagName,
      children: renderChildren(node),
    });
  }
}
