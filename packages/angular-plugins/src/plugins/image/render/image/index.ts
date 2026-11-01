import type {
  AngularRenderMatchParams,
  AngularRenderParams,
} from '@fluxdown/angular-plugins/typings';

import {
  BaseAngularRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/angular-plugins/base';
import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

const Image = /*#__PURE__*/ createTypeOfSlot('Image');

export class ImageRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-image';

  match({ node }: AngularRenderMatchParams) {
    return isElementWithTag(node, 'img');
  }

  render({ getProps, node, parents, render }: AngularRenderParams) {
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
      alt,
      current: node,
      parents,
      render,
      src,
      title,
    });
  }
}
