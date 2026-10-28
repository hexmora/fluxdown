import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';
import { createMemo, Show } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Link = /*#__PURE__*/ createTypeOfSlot('Link');

declare global {
  interface SolidRenderConfigs {
    'render-link': IPluggableConfig<void>;
  }
}

export class LinkRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-link';

  match({ node }: SolidRenderMatchParams) {
    return isElementWithTag(node, 'a');
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isElementWithTag(props.node, 'a'));

      return props.node;
    });

    const href = () => {
      const value = node().properties?.href;

      return isString(value) ? value : '';
    };

    const title = () => {
      const value = node().properties?.title;

      return isString(value) ? value : undefined;
    };

    return (
      <Show when={href().trim()} fallback={props.renderChildren()}>
        <Link
          {...props.getProps(node())}
          current={node()}
          href={href()}
          parents={props.parents}
          render={props.render}
          title={title()}
        >
          {props.renderChildren()}
        </Link>
      </Show>
    );
  }
}
