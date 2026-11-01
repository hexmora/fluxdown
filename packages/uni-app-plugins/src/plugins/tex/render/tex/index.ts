import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { UniRenderMatchParams, UniRenderParams } from '../../../../base';

import { BaseUniRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';
import { getTex, getTexMode } from './utils';

const Tex = /*#__PURE__*/ createTypeOfSlot('Tex');

declare global {
  interface UniRenderConfigs {
    'render-tex': IPluggableConfig<void>;
  }
}

export class TexRenderPlugin extends BaseUniRenderPlugin {
  static readonly key = 'render-tex';

  match(params: UniRenderMatchParams) {
    return getTexMode(params) !== null && getTex(params) !== null;
  }

  render({ getProps, node, parents, render }: UniRenderParams) {
    const mode = getTexMode({ node, parents });

    const tex = getTex({ node, parents });

    assert(isElementWithTag(node, 'span') && mode !== null && tex !== null);

    return Tex({
      ...getProps(node),
      current: node,
      mode: mode,
      parents,
      render,
      tex: tex,
    });
  }
}
