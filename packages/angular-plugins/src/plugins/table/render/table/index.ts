import type {
  AngularRenderMatchParams,
  AngularRenderParams,
} from '@fluxdown/angular-plugins/typings';

import {
  BaseAngularRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/angular-plugins/base';
import { assert } from '@fluxdown/utils';

const Table = /*#__PURE__*/ createTypeOfSlot('Table');

export class TableRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-table';

  match({ node }: AngularRenderMatchParams) {
    return isElementWithTag(node, 'table');
  }

  render({ getProps, node, renderChildren }: AngularRenderParams) {
    assert(isElementWithTag(node, 'table'));

    return Table({
      ...getProps(node),
      children: renderChildren(node),
    });
  }
}
