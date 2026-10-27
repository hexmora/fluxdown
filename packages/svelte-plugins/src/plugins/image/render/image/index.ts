import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import {
  BaseSvelteRenderPlugin,
  createElement,
  createTypeOfSlot,
  isElementWithTag,
} from '../../../../base';

const Image = /*#__PURE__*/ createTypeOfSlot('Image');

declare global {
  interface SvelteRenderConfigs {
    'render-image': IPluggableConfig<void>;
  }
}

export class ImageRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-image';

  match({ node }: SvelteRenderMatchParams) {
    return isElementWithTag(node, 'img');
  }

  render({ getProps, node, parents, render }: SvelteRenderParams) {
    assert(isElementWithTag(node, 'img'));

    const src = node.properties?.src;

    if (!isString(src) || !src.trim()) {
      return null;
    }

    const { alt: _alt, src: _src, title: _title, ...props } = getProps(node);

    const alt = isString(node.properties?.alt) ? node.properties.alt : '';

    const title = isString(node.properties?.title) ? node.properties.title : undefined;

    return createElement(Image, { ...props, alt, current: node, parents, render, src, title });
  }
}
