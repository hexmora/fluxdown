import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { UniRenderMatchParams, UniRenderParams } from '../../../../base';

import { BaseUniRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Table = /*#__PURE__*/ createTypeOfSlot('Table');

declare global {
  interface UniRenderConfigs {
    'render-table': IPluggableConfig<void>;
  }
}

export class TableRenderPlugin extends BaseUniRenderPlugin {
  static readonly key = 'render-table';

  match({ node }: UniRenderMatchParams) {
    return isElementWithTag(node, 'table');
  }

  render({ getProps, node, renderChildren }: UniRenderParams) {
    assert(isElementWithTag(node, 'table'));

    const rows = node.children
      .flatMap((child) => {
        if (isElementWithTag(child, 'thead', 'tbody', 'tfoot')) {
          return child.children;
        }

        return [child];
      })
      .filter((child) => isElementWithTag(child, 'tr'));

    return Table({ ...getProps(node), rows: rows.map((row) => renderChildren(row)) });
  }
}
