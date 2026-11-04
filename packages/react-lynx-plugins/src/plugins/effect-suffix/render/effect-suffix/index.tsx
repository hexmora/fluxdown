import type { IPluggableConfig } from '@fluxdown/types';

import { isSuffixNode, SUFFIX_DATA_ATTR } from '@fluxdown/core-plugins/plugins/mapper/suffix';
import { assert } from '@fluxdown/utils';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin, createTypeOfSlot } from '../../../../base';

const Suffix = /*#__PURE__*/ createTypeOfSlot('Suffix');

declare global {
  interface ReactLynxRenderConfigs {
    'render-suffix': IPluggableConfig<void>;
  }
}

const renderNode = ({ node }: ReactLynxRenderParams) => {
  assert(isSuffixNode(node));

  const type = node.properties[SUFFIX_DATA_ATTR];

  if (type !== 'cursor' && type !== 'dot') {
    return null;
  }

  return <Suffix type={type} />;
};

export class EffectSuffixRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-suffix';

  match({ node }: ReactLynxRenderMatchParams) {
    return isSuffixNode(node);
  }

  readonly render = renderNode;
}
