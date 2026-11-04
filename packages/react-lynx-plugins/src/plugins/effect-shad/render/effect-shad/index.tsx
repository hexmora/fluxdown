import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import {
  BaseReactLynxRenderPlugin,
  createTypeOfSlot,
  getTextContent,
  isElementWithTag,
} from '../../../../base';
import { getShadConfig, isShadNode } from './utils';

const Shad = /*#__PURE__*/ createTypeOfSlot('Shad');

declare global {
  interface ReactLynxRenderConfigs {
    'render-shad': IPluggableConfig<void>;
  }
}

const renderNode = ({ node, renderChildren }: ReactLynxRenderParams) => {
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
};

export class EffectShadRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-shad';

  match({ node }: ReactLynxRenderMatchParams) {
    return isShadNode(node);
  }

  readonly render = renderNode;
}
