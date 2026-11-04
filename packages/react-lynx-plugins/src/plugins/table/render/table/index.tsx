import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Table = /*#__PURE__*/ createTypeOfSlot('Table');

declare global {
  interface ReactLynxRenderConfigs {
    'render-table': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render, renderChildren }: ReactLynxRenderParams) => {
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
};

export class TableRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-table';

  match({ node }: ReactLynxRenderMatchParams) {
    return isElementWithTag(node, 'table');
  }

  readonly render = renderNode;
}
