import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { createMemo } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

declare global {
  interface SolidRenderConfigs {
    'render-blockquote': IPluggableConfig<void>;
  }
}

export class BlockquoteRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-blockquote';

  match({ node }: SolidRenderMatchParams) {
    return isElementWithTag(node, 'blockquote');
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isElementWithTag(props.node, 'blockquote'));

      return props.node;
    });

    return (
      <Blockquote
        {...props.getProps(node())}
        current={node()}
        parents={props.parents}
        render={props.render}
      >
        {props.renderChildren()}
      </Blockquote>
    );
  }
}
