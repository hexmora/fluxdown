import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const BreakLine = /*#__PURE__*/ createTypeOfSlot('BreakLine');

declare global {
  interface ReactLynxRenderConfigs {
    'render-break-line': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node }: ReactLynxRenderParams) => {
  assert(isElementWithTag(node, 'br'));

  return <BreakLine {...getProps(node)} />;
};

export class BreakLineRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-break-line';

  match({ node }: ReactLynxRenderMatchParams) {
    return isElementWithTag(node, 'br');
  }

  readonly render = renderNode;
}
