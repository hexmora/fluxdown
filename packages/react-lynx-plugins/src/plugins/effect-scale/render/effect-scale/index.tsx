import type { IPluggableConfig } from '@fluxdown/types';

import { SCALE_DATA_ATTR, SCALE_WORD_VALUE } from '@fluxdown/core-plugins/plugins/mapper/scale';
import { assert } from '@fluxdown/utils';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getScaleConfig, isScaleNode } from './utils';

const Scale = /*#__PURE__*/ createTypeOfSlot('Scale');

const ScaleWord = /*#__PURE__*/ createTypeOfSlot('ScaleWord');

declare global {
  interface ReactLynxRenderConfigs {
    'render-scale': IPluggableConfig<void>;
  }
}

const renderNode = ({ node, renderChildren }: ReactLynxRenderParams) => {
  assert(isScaleNode(node));

  const children = renderChildren(node);

  if (node.properties[SCALE_DATA_ATTR] === SCALE_WORD_VALUE) {
    return <ScaleWord>{children}</ScaleWord>;
  }

  return <Scale {...getScaleConfig(node)}>{children}</Scale>;
};

export class EffectScaleRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-scale';

  match({ node }: ReactLynxRenderMatchParams) {
    return isScaleNode(node);
  }

  readonly render = renderNode;
}
