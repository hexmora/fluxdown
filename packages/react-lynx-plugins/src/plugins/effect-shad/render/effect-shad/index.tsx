import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getShadConfig, isShadNode } from './utils';

const Shad = /*#__PURE__*/ createTypeOfSlot('Shad');

declare global {
  interface ReactLynxRenderConfigs {
    'render-shad': IPluggableConfig<void>;
  }
}

const renderNode = ({ node, renderChildren }: ReactLynxRenderParams) => {
  assert(isShadNode(node));

  return <Shad {...getShadConfig(node)}>{renderChildren(node)}</Shad>;
};

export class EffectShadRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-shad';

  match({ node }: ReactLynxRenderMatchParams) {
    return isShadNode(node);
  }

  readonly render = renderNode;
}
