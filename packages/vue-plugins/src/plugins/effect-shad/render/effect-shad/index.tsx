import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { VueRenderMatchParams, VueRenderParams } from '../../../../base';

import {
  BaseVueRenderPlugin,
  createTypeOfSlot,
  getTextContent,
  isElementWithTag,
} from '../../../../base';
import { getShadConfig, isShadNode } from './utils';

const Shad = /*#__PURE__*/ createTypeOfSlot('Shad');

declare global {
  interface VueRenderConfigs {
    'render-shad': IPluggableConfig<void>;
  }
}

export class EffectShadRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-shad';

  match({ node }: VueRenderMatchParams) {
    return isShadNode(node);
  }

  render({ node, renderChildren }: VueRenderParams) {
    assert(isShadNode(node));

    const [leading, active] = node.children;

    assert(leading && isElementWithTag(leading, 'span'));

    assert(active && isElementWithTag(active, 'span'));

    return (
      <Shad
        {...getShadConfig(node)}
        active={renderChildren(active)}
        isActive={getTextContent(active).length > 0}
        leading={renderChildren(leading)}
      />
    );
  }
}
