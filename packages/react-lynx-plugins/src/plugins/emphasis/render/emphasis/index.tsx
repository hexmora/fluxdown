import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Emphasis = /*#__PURE__*/ createTypeOfSlot('Emphasis');

declare global {
  interface ReactLynxRenderConfigs {
    'render-emphasis': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render, renderChildren }: ReactLynxRenderParams) => {
  assert(isElementWithTag(node, 'em'));

  return (
    <Emphasis {...getProps(node)} current={node} parents={parents} render={render}>
      {renderChildren(node)}
    </Emphasis>
  );
};

export class EmphasisRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-emphasis';

  match({ node }: ReactLynxRenderMatchParams) {
    return isElementWithTag(node, 'em');
  }

  readonly render = renderNode;
}
