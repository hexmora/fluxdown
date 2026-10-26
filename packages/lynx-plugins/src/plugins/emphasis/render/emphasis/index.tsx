import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { LynxRenderMatchParams, LynxRenderParams } from '../../../../base';

import { BaseLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Emphasis = /*#__PURE__*/ createTypeOfSlot('Emphasis');

declare global {
  interface LynxRenderConfigs {
    'render-emphasis': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render, renderChildren }: LynxRenderParams) => {
  assert(isElementWithTag(node, 'em'));

  return (
    <Emphasis {...getProps(node)} current={node} parents={parents} render={render}>
      {renderChildren(node)}
    </Emphasis>
  );
};

export class EmphasisRenderPlugin extends BaseLynxRenderPlugin {
  static readonly key = 'render-emphasis';

  match({ node }: LynxRenderMatchParams) {
    return isElementWithTag(node, 'em');
  }

  readonly render = renderNode;
}
