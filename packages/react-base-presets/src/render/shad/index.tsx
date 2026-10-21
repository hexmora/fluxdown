import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactRenderMatchParams, ReactRenderParams } from '../../base';

import {
  BaseReactRenderPlugin,
  createTypeOfSlot,
  getTextContent,
  isElementWithTag,
} from '../../base';
import { isShadNode } from './utils';

const Shad = /*#__PURE__*/ createTypeOfSlot('Shad');

declare global {
  interface RenderConfigs {
    'render-shad': IPluggableConfig<void>;
  }
}

export class ShadRenderPlugin extends BaseReactRenderPlugin {
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
      <Shad
        active={renderChildren(active)}
        isActive={getTextContent(active).length > 0}
        leading={renderChildren(leading)}
      />
    );
  }
}
