import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';
import { createMemo } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const TableCell = /*#__PURE__*/ createTypeOfSlot('TableCell');

declare global {
  interface SolidRenderConfigs {
    'render-table-cell': IPluggableConfig<void>;
  }
}

export class TableCellRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-table-cell';

  match({ node }: SolidRenderMatchParams) {
    return isElementWithTag(node, 'td', 'th');
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isElementWithTag(props.node, 'td', 'th'));

      return props.node;
    });

    const align = () => {
      const value = node().properties?.align;

      return isString(value) ? value : undefined;
    };

    return (
      <TableCell {...props.getProps(node())} align={align()} tagName={node().tagName}>
        {props.renderChildren()}
      </TableCell>
    );
  }
}
