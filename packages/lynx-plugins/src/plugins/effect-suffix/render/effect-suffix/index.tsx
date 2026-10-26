import type { IPluggableConfig } from '@fluxdown/types';

import { isSuffixNode, SUFFIX_DATA_ATTR } from '@fluxdown/core-plugins/plugins/mapper/suffix';
import { assert } from '@fluxdown/utils';

import type { LynxRenderMatchParams, LynxRenderParams } from '../../../../base';

import { BaseLynxRenderPlugin, createTypeOfSlot } from '../../../../base';

const Suffix = /*#__PURE__*/ createTypeOfSlot('Suffix');

declare global {
  interface LynxRenderConfigs {
    'render-suffix': IPluggableConfig<void>;
  }
}

const renderNode = ({ node }: LynxRenderParams) => {
  assert(isSuffixNode(node));

  const type = node.properties[SUFFIX_DATA_ATTR];

  if (type !== 'cursor' && type !== 'dot') {
    return null;
  }

  return <Suffix type={type} />;
};

export class EffectSuffixRenderPlugin extends BaseLynxRenderPlugin {
  static readonly key = 'render-suffix';

  match({ node }: LynxRenderMatchParams) {
    return isSuffixNode(node);
  }

  readonly render = renderNode;
}
