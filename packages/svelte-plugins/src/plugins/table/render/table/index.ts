import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import {
  BaseSvelteRenderPlugin,
  createElement,
  createTypeOfSlot,
  isElementWithTag,
} from '../../../../base';

const Table = /*#__PURE__*/ createTypeOfSlot('Table');

declare global {
  interface SvelteRenderConfigs {
    'render-table': IPluggableConfig<void>;
  }
}

export class TableRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-table';

  match({ node }: SvelteRenderMatchParams) {
    return isElementWithTag(node, 'table');
  }

  render({ getProps, node, renderChildren }: SvelteRenderParams) {
    assert(isElementWithTag(node, 'table'));

    return createElement(Table, getProps(node), renderChildren(node));
  }
}
