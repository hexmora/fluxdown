import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { LynxRenderMatchParams, LynxRenderParams } from '../../../../base';

import { BaseLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Strong = /*#__PURE__*/ createTypeOfSlot('Strong');

declare global {
  interface LynxRenderConfigs {
    'render-strong': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render, renderChildren }: LynxRenderParams) => {
  assert(isElementWithTag(node, 'b', 'strong'));

  return (
    <Strong {...getProps(node)} current={node} parents={parents} render={render}>
      {renderChildren(node)}
    </Strong>
  );
};

export class StrongRenderPlugin extends BaseLynxRenderPlugin {
  static readonly key = 'render-strong';

  match({ node }: LynxRenderMatchParams) {
    return isElementWithTag(node, 'b', 'strong');
  }

  readonly render = renderNode;
}
