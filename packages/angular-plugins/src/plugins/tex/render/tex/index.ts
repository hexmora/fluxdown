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

import { getTex, getTexMode } from './utils';

const Tex = /*#__PURE__*/ createTypeOfSlot('Tex');

export class TexRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-tex';

  match(params: AngularRenderMatchParams) {
    return getTexMode(params) !== null && getTex(params) !== null;
  }

  render({ getProps, node, parents, render }: AngularRenderParams) {
    const mode = getTexMode({ node, parents });

    const tex = getTex({ node, parents });

    assert(isElementWithTag(node, 'span') && mode !== null && tex !== null);

    return Tex({
      ...getProps(node),
      current: node,
      mode,
      parents,
      render,
      tex,
    });
  }
}
