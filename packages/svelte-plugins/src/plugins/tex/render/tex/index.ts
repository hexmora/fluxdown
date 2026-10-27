import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import {
  BaseSvelteRenderPlugin,
  createElement,
  createTypeOfSlot,
  isElementWithTag,
} from '../../../../base';
import { getTex, getTexMode } from './utils';

const Tex = /*#__PURE__*/ createTypeOfSlot('Tex');

declare global {
  interface SvelteRenderConfigs {
    'render-tex': IPluggableConfig<void>;
  }
}

export class TexRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-tex';

  match(params: SvelteRenderMatchParams) {
    return getTexMode(params) !== null && getTex(params) !== null;
  }

  render({ getProps, node, parents, render }: SvelteRenderParams) {
    const mode = getTexMode({ node, parents });

    const tex = getTex({ node, parents });

    assert(isElementWithTag(node, 'span') && mode !== null && tex !== null);

    return createElement(Tex, { ...getProps(node), current: node, mode, parents, render, tex });
  }
}
