import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

import type { VueRenderMatchParams, VueRenderParams } from '../../../../base';

import { BaseVueRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const TableCell = /*#__PURE__*/ createTypeOfSlot('TableCell');

declare global {
  interface VueRenderConfigs {
    'render-table-cell': IPluggableConfig<void>;
  }
}

export class TableCellRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-table-cell';

  match({ node }: VueRenderMatchParams) {
    return isElementWithTag(node, 'td', 'th');
  }

  render({ getProps, node, renderChildren }: VueRenderParams) {
    assert(isElementWithTag(node, 'td', 'th'));

    const { align: _align, ...props } = getProps(node);

    const align = node.properties?.align;

    return (
      <TableCell {...props} align={isString(align) ? align : undefined} tagName={node.tagName}>
        {renderChildren(node)}
      </TableCell>
    );
  }
}
