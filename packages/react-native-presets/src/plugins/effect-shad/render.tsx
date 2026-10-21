import type { ReactRenderMatchParams, ReactRenderParams } from '@fluxdown/react-base-presets/base';
import type { IPluggableConfig } from '@fluxdown/types';

import {
  BaseReactRenderPlugin,
  getTextContent,
  isElementWithTag,
} from '@fluxdown/react-base-presets/base';
import { assert } from '@fluxdown/utils';

import type { IPluginItem } from '../../typings';

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

    const [leading, active] = node.children;

    assert(leading && isElementWithTag(leading, 'span'));

    assert(active && isElementWithTag(active, 'span'));

    return (
      <ShadRenderer
        {...getShadConfig(node)}
        active={renderChildren(active)}
        isActive={getTextContent(active).length > 0}
        leading={renderChildren(leading)}
      />
    );
  }
}

export const EffectShadPlugin: IPluginItem = { renders: [EffectShadRenderPlugin] };
