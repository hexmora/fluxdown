import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { createMemo } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getHeadingLevel, isHeadingNode } from './utils';

const Heading = /*#__PURE__*/ createTypeOfSlot('Heading');

declare global {
  interface SolidRenderConfigs {
    'render-heading': IPluggableConfig<void>;
  }
}

export class HeadingRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-heading';

  match({ node }: SolidRenderMatchParams) {
    return isHeadingNode(node);
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isHeadingNode(props.node));

      return props.node;
    });

    return (
      <Heading
        {...props.getProps(node())}
        current={node()}
        level={getHeadingLevel(node().tagName)}
        parents={props.parents}
        render={props.render}
      >
        {props.renderChildren()}
      </Heading>
    );
  }
}
