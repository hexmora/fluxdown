import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

import type { LynxRenderMatchParams, LynxRenderParams } from '../../../../base';

import { BaseLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const TableCell = /*#__PURE__*/ createTypeOfSlot('TableCell');

declare global {
  interface LynxRenderConfigs {
    'render-table-cell': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render, renderChildren }: LynxRenderParams) => {
  assert(isElementWithTag(node, 'td', 'th'));

  const { align: _align, ...props } = getProps(node);

  const align = node.properties?.align;

  return (
    <TableCell
      {...props}
      current={node}
      parents={parents}
      render={render}
      align={isString(align) ? align : undefined}
      tagName={node.tagName}
    >
      {renderChildren(node)}
    </TableCell>
  );
};

export class TableCellRenderPlugin extends BaseLynxRenderPlugin {
  static readonly key = 'render-table-cell';

  match({ node }: LynxRenderMatchParams) {
    return isElementWithTag(node, 'td', 'th');
  }

  readonly render = renderNode;
}
