import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactRenderMatchParams, ReactRenderParams } from '../../base';

import { BaseReactRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../base';

const TableCell = /*#__PURE__*/ createTypeOfSlot('TableCell');

declare global {
  interface RenderConfigs {
    'render-table-cell'?: IPluggableConfig<void>;
  }
}

export class TableCellRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-table-cell';

  match({ node }: ReactRenderMatchParams) {
    return isElementWithTag(node, 'td', 'th');
  }

  render({ getProps, node, parents, render, renderChildren }: ReactRenderParams) {
    assert(isElementWithTag(node, 'td', 'th'));

    return (
      <TableCell
        {...getProps(node)}
        current={node}
        parents={parents}
        render={render}
        renderChildren={renderChildren}
      />
    );
  }
}
