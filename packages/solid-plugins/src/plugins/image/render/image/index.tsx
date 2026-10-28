import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';
import { createMemo, Show } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Image = /*#__PURE__*/ createTypeOfSlot('Image');

declare global {
  interface SolidRenderConfigs {
    'render-image': IPluggableConfig<void>;
  }
}

export class ImageRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-image';

  match({ node }: SolidRenderMatchParams) {
    return isElementWithTag(node, 'img');
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isElementWithTag(props.node, 'img'));

      return props.node;
    });

    const src = () => {
      const value = node().properties?.src;

      return isString(value) ? value : '';
    };

    const title = () => {
      const value = node().properties?.title;

      return isString(value) ? value : undefined;
    };

    const alt = () => {
      const value = node().properties?.alt;

      return isString(value) ? value : '';
    };

    return (
      <Show when={src().trim()}>
        <Image
          {...props.getProps(node())}
          alt={alt()}
          current={node()}
          parents={props.parents}
          render={props.render}
          src={src()}
          title={title()}
        />
      </Show>
    );
  }
}
