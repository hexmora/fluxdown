import type { IPluggableConfig } from '@fluxdown/types';

import { isSuffixNode, SUFFIX_DATA_ATTR } from '@fluxdown/core-presets/plugins/mapper/suffix';
import { assert } from '@fluxdown/utils';

import type { ReactRenderMatchParams, ReactRenderParams } from '../../../../base';

import { BaseReactRenderPlugin } from '../../../../base';
import { SuffixRenderer } from './renderer';

export * from './renderer';

declare global {
  interface RenderConfigs {
    'render-suffix': IPluggableConfig<void>;
  }
}

export class EffectSuffixRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-suffix';

  match({ node }: ReactRenderMatchParams) {
    return isSuffixNode(node);
  }

  render({ node }: ReactRenderParams) {
    assert(isSuffixNode(node));

    const type = node.properties[SUFFIX_DATA_ATTR];

    if (type !== 'cursor' && type !== 'dot') {
      return null;
    }

    return <SuffixRenderer type={type} />;
  }
}
