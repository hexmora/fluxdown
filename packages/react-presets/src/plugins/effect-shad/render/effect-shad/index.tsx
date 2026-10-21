import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactRenderMatchParams, ReactRenderParams } from '../../../../base';

import { BaseReactRenderPlugin } from '../../../../base';
import { ShadRenderer } from './renderer';
import { getShadConfig, isShadNode } from './utils';

declare global {
  interface RenderConfigs {
    'render-shad': IPluggableConfig<void>;
  }
}

export class EffectShadRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-shad';

  match({ node }: ReactRenderMatchParams) {
    return isShadNode(node);
  }

  render({ node, renderChildren }: ReactRenderParams) {
    assert(isShadNode(node));

    return <ShadRenderer {...getShadConfig(node)}>{renderChildren(node)}</ShadRenderer>;
  }
}
