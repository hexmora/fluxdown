import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { createMemo } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import {
  BaseSolidRenderPlugin,
  createTypeOfSlot,
  getTextContent,
  isElementWithTag,
} from '../../../../base';
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

    const leading = createMemo(() => {
      const child = node().children[0];

      assert(child && isElementWithTag(child, 'span'));

      return child;
    });

    const active = createMemo(() => {
      const child = node().children[1];

      assert(child && isElementWithTag(child, 'span'));

      return child;
    });

    return (
      <Shad
        {...getShadConfig(node())}
        active={props.renderChildren(active)}
        isActive={getTextContent(active()).length > 0}
        leading={props.renderChildren(leading)}
      />
    );
  }
}
