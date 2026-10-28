import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { createMemo } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Strong = /*#__PURE__*/ createTypeOfSlot('Strong');

declare global {
  interface SolidRenderConfigs {
    'render-strong': IPluggableConfig<void>;
  }
}

export class StrongRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-strong';

  match({ node }: SolidRenderMatchParams) {
    return isElementWithTag(node, 'b', 'strong');
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isElementWithTag(props.node, 'b', 'strong'));

      return props.node;
    });

    return (
      <Strong
        {...props.getProps(node())}
        current={node()}
        parents={props.parents}
        render={props.render}
      >
        {props.renderChildren()}
      </Strong>
    );
  }
}
