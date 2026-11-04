import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getHeadingLevel, isHeadingNode } from './utils';

const Heading = /*#__PURE__*/ createTypeOfSlot('Heading');

declare global {
  interface ReactLynxRenderConfigs {
    'render-heading': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render, renderChildren }: ReactLynxRenderParams) => {
  assert(isHeadingNode(node));

  const level = getHeadingLevel(node.tagName);

  return (
    <Heading {...getProps(node)} current={node} level={level} parents={parents} render={render}>
      {renderChildren(node)}
    </Heading>
  );
};

export class HeadingRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-heading';

  match({ node }: ReactLynxRenderMatchParams) {
    return isHeadingNode(node);
  }

  readonly render = renderNode;
}
