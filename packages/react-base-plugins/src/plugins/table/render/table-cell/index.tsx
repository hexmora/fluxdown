import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

import type { ReactRenderMatchParams, ReactRenderParams } from '../../../../base';

import { BaseReactRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const TableCell = /*#__PURE__*/ createTypeOfSlot('TableCell');

declare global {
  interface RenderConfigs {
    'render-table-cell': IPluggableConfig<void>;
  }
}

export class TableCellRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-table-cell';

  match({ node }: ReactRenderMatchParams) {
    return isElementWithTag(node, 'td', 'th');
  }

  render({ getProps, node, renderChildren }: ReactRenderParams) {
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
