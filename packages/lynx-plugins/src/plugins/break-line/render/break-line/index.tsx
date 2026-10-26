import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { LynxRenderMatchParams, LynxRenderParams } from '../../../../base';

import { BaseLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const BreakLine = /*#__PURE__*/ createTypeOfSlot('BreakLine');

declare global {
  interface LynxRenderConfigs {
    'render-break-line': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node }: LynxRenderParams) => {
  assert(isElementWithTag(node, 'br'));

  return <BreakLine {...getProps(node)} />;
};

export class BreakLineRenderPlugin extends BaseLynxRenderPlugin {
  static readonly key = 'render-break-line';

  match({ node }: LynxRenderMatchParams) {
    return isElementWithTag(node, 'br');
  }

  readonly render = renderNode;
}
