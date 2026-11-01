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

const BreakLine = /*#__PURE__*/ createTypeOfSlot('BreakLine');

export class BreakLineRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-break-line';

  match({ node }: AngularRenderMatchParams) {
    return isElementWithTag(node, 'br');
  }

  render({ getProps, node }: AngularRenderParams) {
    assert(isElementWithTag(node, 'br'));

    return BreakLine({
      ...getProps(node),
    });
  }
}
