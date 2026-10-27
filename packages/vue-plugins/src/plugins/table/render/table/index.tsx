import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { VueRenderMatchParams, VueRenderParams } from '../../../../base';

import { BaseVueRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

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

  render({ getProps, node, renderChildren }: VueRenderParams) {
    assert(isElementWithTag(node, 'table'));

    return <Table {...getProps(node)}>{renderChildren(node)}</Table>;
  }
}
