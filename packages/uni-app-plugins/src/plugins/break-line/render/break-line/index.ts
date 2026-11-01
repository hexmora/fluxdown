import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { UniRenderMatchParams, UniRenderParams } from '../../../../base';

import { BaseUniRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const BreakLine = /*#__PURE__*/ createTypeOfSlot('BreakLine');

declare global {
  interface UniRenderConfigs {
    'render-break-line': IPluggableConfig<void>;
  }
}

export class BreakLineRenderPlugin extends BaseUniRenderPlugin {
  static readonly key = 'render-break-line';

  match({ node }: UniRenderMatchParams) {
    return isElementWithTag(node, 'br');
  }

  render({ getProps, node }: UniRenderParams) {
    assert(isElementWithTag(node, 'br'));

    return BreakLine({ ...getProps(node) });
  }
}
