import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { UniRenderMatchParams, UniRenderParams } from '../../../../base';

import { BaseUniRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getHeadingLevel, isHeadingNode } from './utils';

const Heading = /*#__PURE__*/ createTypeOfSlot('Heading');

declare global {
  interface UniRenderConfigs {
    'render-heading': IPluggableConfig<void>;
  }
}

export class HeadingRenderPlugin extends BaseUniRenderPlugin {
  static readonly key = 'render-heading';

  match({ node }: UniRenderMatchParams) {
    return isHeadingNode(node);
  }

  render({ getProps, node, parents, render, renderChildren }: UniRenderParams) {
    assert(isHeadingNode(node));

    const level = getHeadingLevel(node.tagName);

    return Heading(
      { ...getProps(node), current: node, level, parents, render },
      renderChildren(node),
    );
  }
}
