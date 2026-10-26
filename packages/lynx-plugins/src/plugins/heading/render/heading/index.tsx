import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { LynxRenderMatchParams, LynxRenderParams } from '../../../../base';

import { BaseLynxRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getHeadingLevel, isHeadingNode } from './utils';

const Heading = /*#__PURE__*/ createTypeOfSlot('Heading');

declare global {
  interface LynxRenderConfigs {
    'render-heading': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render, renderChildren }: LynxRenderParams) => {
  assert(isHeadingNode(node));

  const level = getHeadingLevel(node.tagName);

  return (
    <Heading {...getProps(node)} current={node} level={level} parents={parents} render={render}>
      {renderChildren(node)}
    </Heading>
  );
};

export class HeadingRenderPlugin extends BaseLynxRenderPlugin {
  static readonly key = 'render-heading';

  match({ node }: LynxRenderMatchParams) {
    return isHeadingNode(node);
  }

  readonly render = renderNode;
}
