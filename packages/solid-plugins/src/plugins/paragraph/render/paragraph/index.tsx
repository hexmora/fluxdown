import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { createMemo, Show } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

declare global {
  interface SolidRenderConfigs {
    'render-paragraph': IPluggableConfig<void>;
  }
}

export class ParagraphRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-paragraph';

  match({ node }: SolidRenderMatchParams) {
    return isElementWithTag(node, 'p');
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isElementWithTag(props.node, 'p'));

      return props.node;
    });

    return (
      <Show when={node().children.length > 0}>
        <Paragraph
          {...props.getProps(node())}
          current={node()}
          parents={props.parents}
          render={props.render}
        >
          {props.renderChildren()}
        </Paragraph>
      </Show>
    );
  }
}
