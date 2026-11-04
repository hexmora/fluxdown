import type { IPluggableConfig } from '@fluxdown/types';
import type { VueRenderMatchParams, VueRenderParams } from '@fluxdown/vue-base-plugins/base';

import { assert } from '@fluxdown/utils';
import { BaseVueRenderPlugin, isElementWithTag } from '@fluxdown/vue-base-plugins/base';

import { createTypeOfSlot } from '../../../../base';

const Table = /*#__PURE__*/ createTypeOfSlot('Table');

declare global {
  interface VueRenderConfigs {
    'render-table': IPluggableConfig<void>;
  }
}

export class TableRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-table';

  match({ node }: VueRenderMatchParams) {
    return isElementWithTag(node, 'table');
  }

  render({ getProps, node, parents, render, renderChildren }: VueRenderParams) {
    assert(isElementWithTag(node, 'table'));

    const rows = node.children.flatMap((group) => {
      if (group.type !== 'element') {
        return [];
      }

      const children = group.tagName === 'tr' ? [group] : group.children;

      return children
        .filter((row) => isElementWithTag(row, 'tr'))
        .map((row, index) => ({
          ...row,

          properties: {
            ...row.properties,
            dataFluxdownStripe: group.tagName === 'tbody' && index % 2 === 1,
          },
        }));
    });

    const columns = Math.max(
      1,
      ...rows.map(
        (row) => row.children.filter((child) => isElementWithTag(child, 'td', 'th')).length,
      ),
    );

    return (
      <Table {...getProps(node)} columns={columns} current={node} parents={parents} render={render}>
        {rows.map((row, index) => {
          const currentRow = {
            ...row,
            properties: { ...row.properties, dataFluxdownLastRow: index === rows.length - 1 },
          };

          return renderChildren(currentRow);
        })}
      </Table>
    );
  }
}
