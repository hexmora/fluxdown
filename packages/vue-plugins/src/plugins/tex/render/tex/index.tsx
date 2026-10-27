import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { VueRenderMatchParams, VueRenderParams } from '../../../../base';

import { BaseVueRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';
import { getTex, getTexMode } from './utils';

const Tex = /*#__PURE__*/ createTypeOfSlot('Tex');

declare global {
  interface VueRenderConfigs {
    'render-tex': IPluggableConfig<void>;
  }
}

export class TexRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-tex';

  match(params: VueRenderMatchParams) {
    return getTexMode(params) !== null && getTex(params) !== null;
  }

  render({ getProps, node, parents, render }: VueRenderParams) {
    const mode = getTexMode({ node, parents });

    const tex = getTex({ node, parents });

    assert(isElementWithTag(node, 'span') && mode !== null && tex !== null);

    return (
      <Tex
        {...getProps(node)}
        current={node}
        mode={mode}
        parents={parents}
        render={render}
        tex={tex}
      />
    );
  }
}
