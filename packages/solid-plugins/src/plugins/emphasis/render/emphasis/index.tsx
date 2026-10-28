import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { createMemo } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Emphasis = /*#__PURE__*/ createTypeOfSlot('Emphasis');

declare global {
  interface SolidRenderConfigs {
    'render-emphasis': IPluggableConfig<void>;
  }
}

export class EmphasisRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-emphasis';

  match({ node }: SolidRenderMatchParams) {
    return isElementWithTag(node, 'em');
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isElementWithTag(props.node, 'em'));

      return props.node;
    });

    return (
      <Emphasis
        {...props.getProps(node())}
        current={node()}
        parents={props.parents}
        render={props.render}
      >
        {props.renderChildren()}
      </Emphasis>
    );
  }
}
