import type { IPluggableConfig } from '@fluxdown/types';

import { SCALE_DATA_ATTR, SCALE_WORD_VALUE } from '@fluxdown/core-presets/plugins/mapper/scale';
import { assert } from '@fluxdown/utils';

import type { ReactRenderMatchParams, ReactRenderParams } from '../../../../base';

import { BaseReactRenderPlugin } from '../../../../base';
import { ScaleRenderer, ScaleWordRenderer } from './renderer';
import { getScaleConfig, isScaleNode } from './utils';

declare global {
  interface RenderConfigs {
    'render-scale': IPluggableConfig<void>;
  }
}

export class EffectScaleRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-scale';

  match({ node }: ReactRenderMatchParams) {
    return isScaleNode(node);
  }

  render({ node, renderChildren }: ReactRenderParams) {
    assert(isScaleNode(node));

    const children = renderChildren(node);

    if (node.properties[SCALE_DATA_ATTR] === SCALE_WORD_VALUE) {
      return <ScaleWordRenderer>{children}</ScaleWordRenderer>;
    }

    return <ScaleRenderer {...getScaleConfig(node)}>{children}</ScaleRenderer>;
  }
}
