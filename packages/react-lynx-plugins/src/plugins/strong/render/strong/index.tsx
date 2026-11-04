import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Strong = /*#__PURE__*/ createTypeOfSlot('Strong');

declare global {
  interface ReactLynxRenderConfigs {
    'render-strong': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render, renderChildren }: ReactLynxRenderParams) => {
  assert(isElementWithTag(node, 'b', 'strong'));

  return (
    <Strong {...getProps(node)} current={node} parents={parents} render={render}>
      {renderChildren(node)}
    </Strong>
  );
};

export class StrongRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-strong';

  match({ node }: ReactLynxRenderMatchParams) {
    return isElementWithTag(node, 'b', 'strong');
  }

  readonly render = renderNode;
}
