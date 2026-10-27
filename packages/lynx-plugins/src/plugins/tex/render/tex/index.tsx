import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { LynxRenderMatchParams, LynxRenderParams } from '../../../../base';

import { BaseLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';
import { getTex, getTexMode } from './utils';

const Tex = /*#__PURE__*/ createTypeOfSlot('Tex');

declare global {
  interface LynxRenderConfigs {
    'render-tex': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render }: LynxRenderParams) => {
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
};

export class TexRenderPlugin extends BaseLynxRenderPlugin {
  static readonly key = 'render-tex';

  match(params: LynxRenderMatchParams) {
    return getTexMode(params) !== null && getTex(params) !== null;
  }

  readonly render = renderNode;
}
