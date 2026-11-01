import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

import type { UniRenderMatchParams, UniRenderParams } from '../../../../base';

import { BaseUniRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Image = /*#__PURE__*/ createTypeOfSlot('Image');

declare global {
  interface UniRenderConfigs {
    'render-image': IPluggableConfig<void>;
  }
}

export class ImageRenderPlugin extends BaseUniRenderPlugin {
  static readonly key = 'render-image';

  match({ node }: UniRenderMatchParams) {
    return isElementWithTag(node, 'img');
  }

  render({ getProps, node, parents, render }: UniRenderParams) {
    assert(isElementWithTag(node, 'img'));

    const src = node.properties?.src;

    if (!isString(src) || !src.trim()) {
      return null;
    }

    const { alt: _alt, src: _src, title: _title, ...props } = getProps(node);

    const alt = isString(node.properties?.alt) ? node.properties.alt : '';

    const title = isString(node.properties?.title) ? node.properties.title : undefined;

    return Image({
      ...props,
      alt: alt,
      current: node,
      parents,
      render,
      src: src,
      title: title,
    });
  }
}
