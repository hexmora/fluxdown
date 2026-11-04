import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const TableCell = /*#__PURE__*/ createTypeOfSlot('TableCell');

declare global {
  interface ReactLynxRenderConfigs {
    'render-table-cell': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render, renderChildren }: ReactLynxRenderParams) => {
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

export class TableCellRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-table-cell';

  match({ node }: ReactLynxRenderMatchParams) {
    return isElementWithTag(node, 'td', 'th');
  }

  readonly render = renderNode;
}
