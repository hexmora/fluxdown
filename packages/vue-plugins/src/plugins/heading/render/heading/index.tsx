import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { VueRenderMatchParams, VueRenderParams } from '../../../../base';

import { BaseVueRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getHeadingLevel, isHeadingNode } from './utils';

const Heading = /*#__PURE__*/ createTypeOfSlot('Heading');

declare global {
  interface VueRenderConfigs {
    'render-heading': IPluggableConfig<void>;
  }
}

export class HeadingRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-heading';

  match({ node }: VueRenderMatchParams) {
    return isHeadingNode(node);
  }

  render({ getProps, node, parents, render, renderChildren }: VueRenderParams) {
    assert(isHeadingNode(node));

    const level = getHeadingLevel(node.tagName);

    return (
      <Heading {...getProps(node)} current={node} level={level} parents={parents} render={render}>
        {renderChildren(node)}
      </Heading>
    );
  }
}
