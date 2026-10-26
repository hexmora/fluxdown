import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { LynxRenderMatchParams, LynxRenderParams } from '../../../../base';

import {
  BaseLynxRenderPlugin,
  createTypeOfSlot,
  getTextContent,
  isElementWithTag,
} from '../../../../base';
import { getShadConfig, isShadNode } from './utils';

const Shad = /*#__PURE__*/ createTypeOfSlot('Shad');

declare global {
  interface LynxRenderConfigs {
    'render-shad': IPluggableConfig<void>;
  }
}

const renderNode = ({ node, renderChildren }: LynxRenderParams) => {
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

export class EffectShadRenderPlugin extends BaseLynxRenderPlugin {
  static readonly key = 'render-shad';

  match({ node }: LynxRenderMatchParams) {
    return isShadNode(node);
  }

  readonly render = renderNode;
}
