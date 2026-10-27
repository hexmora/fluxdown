import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { LynxRenderMatchParams, LynxRenderParams } from '../../../../base';

import { BaseLynxRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getShadConfig, isShadNode } from './utils';

const Shad = /*#__PURE__*/ createTypeOfSlot('Shad');

declare global {
  interface LynxRenderConfigs {
    'render-shad': IPluggableConfig<void>;
  }
}

const renderNode = ({ node, renderChildren }: LynxRenderParams) => {
  assert(isShadNode(node));

  return <Shad {...getShadConfig(node)}>{renderChildren(node)}</Shad>;
};

export class EffectShadRenderPlugin extends BaseLynxRenderPlugin {
  static readonly key = 'render-shad';

  match({ node }: LynxRenderMatchParams) {
    return isShadNode(node);
  }

  readonly render = renderNode;
}
