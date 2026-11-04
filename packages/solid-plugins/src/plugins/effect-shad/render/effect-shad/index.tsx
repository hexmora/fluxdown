import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { createMemo } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getShadConfig, isShadNode } from './utils';

const Shad = /*#__PURE__*/ createTypeOfSlot('Shad');

declare global {
  interface SolidRenderConfigs {
    'render-shad': IPluggableConfig<void>;
  }
}

export class EffectShadRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-shad';

  match({ node }: SolidRenderMatchParams) {
    return isShadNode(node);
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isShadNode(props.node));

      return props.node;
    });

    return <Shad {...getShadConfig(node())}>{props.renderChildren()}</Shad>;
  }
}
